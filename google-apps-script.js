/**
 * =========================================================================
 * GOOGLE APPS SCRIPT CHO THIỆP CƯỚI TUẤN HÙNG & SAO MAI
 * =========================================================================
 * 
 * Hướng dẫn cài đặt và triển khai:
 * 1. Mở file Google Sheets "Đám cưới - Hùng Mai" của bạn.
 *    (Đảm bảo có 2 trang tính với tên đúng như mẫu: "Confirm" và "Congra")
 * 2. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xóa hết mã cũ trong file `Code.gs` và dán toàn bộ đoạn mã bên dưới vào.
 * 4. Bấm "Lưu" (biểu tượng đĩa mềm hoặc Ctrl + S).
 * 5. Bấm nút "Triển khai" (Deploy) ở góc trên bên phải -> "Quản lý bản triển khai mới" (New deployment).
 *    - Chọn loại: "Ứng dụng web" (Web app)
 *    - Mô tả: "Wedding RSVP & Wishes Webhook"
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)  <-- BẮT BUỘC CHỌN CÁI NÀY
 * 6. Bấm "Triển khai" (Deploy) -> Cấp quyền truy cập nếu Google yêu cầu.
 * 7. Sao chép đường link "URL của ứng dụng web" (Web app URL có đuôi /exec).
 * 8. Dán đường link đó vào file `.env` của dự án web:
 *    VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/xxxxxx/exec
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Khóa tối đa 10s để tránh xung đột khi nhiều người gửi cùng lúc
  lock.tryLock(10000);

  try {
    var rawData = e.postData ? e.postData.contents : null;
    if (!rawData) {
      return createJsonResponse({ ok: false, error: 'No data received' });
    }

    var data = JSON.parse(rawData);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var now = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'HH:mm:ss dd/MM/yyyy');

    if (data.type === 'rsvp') {
      return handleRsvp(ss, data, now);
    } else if (data.type === 'wish') {
      return handleWish(ss, data, now);
    } else {
      return createJsonResponse({ ok: false, error: 'Unknown submission type' });
    }

  } catch (error) {
    return createJsonResponse({ ok: false, error: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return createJsonResponse({
    ok: true,
    message: 'Hệ thống tiếp nhận phản hồi thiệp cưới Tuấn Hùng & Sao Mai đang hoạt động bình thường.'
  });
}

/**
 * Xử lý Form 1: Xác nhận tham dự (Lưu vào tab 'Confirm')
 */
function handleRsvp(ss, data, now) {
  var sheet = ss.getSheetByName('Confirm');
  if (!sheet) {
    sheet = ss.insertSheet('Confirm');
  }

  // Khởi tạo tiêu đề cột nếu sheet còn trống
  if (sheet.getLastRow() === 0) {
    var headers = [
      'Thời Gian',
      'Mã Định Danh (ID)',
      'Họ và Tên',
      'Bên Khách',
      'Xác Nhận Tham Dự',
      'Số Người',
      'Lời Nhắn',
      'Cập Nhật Lần Cuối'
    ];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#c91d26');
    headerRange.setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  var sideLabel = formatSide(data.side);
  var recordId = data.id || ('rsvp_' + new Date().getTime());
  var guestName = (data.guestName || '').trim();
  var attendance = (data.attendance || '').trim();
  var partySize = Number(data.partySize) || 1;
  var message = (data.message || '').trim();

  // Tìm kiếm xem người này đã từng gửi chưa (dựa theo ID)
  var existingRowIndex = -1;
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    var idValues = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    for (var i = 0; i < idValues.length; i++) {
      if (idValues[i][0] == recordId) {
        existingRowIndex = i + 2; // offset từ hàng 2
        break;
      }
    }
  }

  if (existingRowIndex > 0) {
    // Khách sửa lại thông tin: Cập nhật trực tiếp vào dòng cũ
    sheet.getRange(existingRowIndex, 3).setValue(guestName);
    sheet.getRange(existingRowIndex, 4).setValue(sideLabel);
    sheet.getRange(existingRowIndex, 5).setValue(attendance);
    sheet.getRange(existingRowIndex, 6).setValue(partySize);
    sheet.getRange(existingRowIndex, 7).setValue(message);
    sheet.getRange(existingRowIndex, 8).setValue(now);
    return createJsonResponse({ ok: true, action: 'updated', id: recordId });
  } else {
    // Khách gửi mới lần đầu
    sheet.appendRow([
      now,
      recordId,
      guestName,
      sideLabel,
      attendance,
      partySize,
      message,
      now
    ]);
    return createJsonResponse({ ok: true, action: 'created', id: recordId });
  }
}

/**
 * Xử lý Form 2: Gửi lời chúc (Lưu vào tab 'Congra')
 */
function handleWish(ss, data, now) {
  var sheet = ss.getSheetByName('Congra');
  if (!sheet) {
    sheet = ss.insertSheet('Congra');
  }

  // Khởi tạo tiêu đề cột nếu sheet còn trống
  if (sheet.getLastRow() === 0) {
    var headers = [
      'Thời Gian',
      'Mã Định Danh (ID)',
      'Họ và Tên',
      'Bên Khách',
      'Lời Chúc',
      'Cập Nhật Lần Cuối'
    ];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#c91d26');
    headerRange.setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  var sideLabel = formatSide(data.side);
  var recordId = data.id || ('wish_' + new Date().getTime());
  var name = (data.name || '').trim();
  var message = (data.message || '').trim();

  // Tìm kiếm xem người này đã từng gửi chưa (dựa theo ID)
  var existingRowIndex = -1;
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    var idValues = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    for (var i = 0; i < idValues.length; i++) {
      if (idValues[i][0] == recordId) {
        existingRowIndex = i + 2;
        break;
      }
    }
  }

  if (existingRowIndex > 0) {
    // Sửa lại lời chúc cũ
    sheet.getRange(existingRowIndex, 3).setValue(name);
    sheet.getRange(existingRowIndex, 4).setValue(sideLabel);
    sheet.getRange(existingRowIndex, 5).setValue(message);
    sheet.getRange(existingRowIndex, 6).setValue(now);
    return createJsonResponse({ ok: true, action: 'updated', id: recordId });
  } else {
    // Gửi lời chúc mới
    sheet.appendRow([
      now,
      recordId,
      name,
      sideLabel,
      message,
      now
    ]);
    return createJsonResponse({ ok: true, action: 'created', id: recordId });
  }
}

function formatSide(side) {
  if (side === 'groom') return 'Nhà Trai';
  if (side === 'bride') return 'Nhà Gái';
  return 'Cả hai bên';
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
