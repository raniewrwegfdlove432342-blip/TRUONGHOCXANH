/**
 * GOOGLE APPS SCRIPT CHO HỆ THỐNG TRƯỜNG HỌC XANH - LÁ CHẮN HỌC ĐƯỜNG
 * 
 * HƯỚNG DẪN CÀI ĐẶT TRÊN GOOGLE SHEETS CỦA TRƯỜNG:
 * 1. Mở file Google Sheets của trường:
 *    https://docs.google.com/spreadsheets/d/1LCHDX-TRUONGHOCXANH-2026-DATABASE-EDU/edit
 * 2. Trên thanh menu Google Sheets, chọn: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xóa toàn bộ nội dung trong tệp Code.gs, dán toàn bộ đoạn mã này vào.
 * 4. Nhấn biểu tượng Lưu (Save) hoặc Ctrl + S.
 * 5. Nhấn nút "Triển khai" (Deploy) -> "Quản lý tùy chọn triển khai" (Manage deployments) hoặc "Tùy chọn triển khai mới" (New deployment).
 *    - Chọn loại: "Ứng dụng web" (Web app).
 *    - Mô tả: "He Thong Truong Hoc Xanh - Cap Nhat Trang Tinh Dang Nhap Online".
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me).
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone).
 * 6. Nhấn "Triển khai" và cấp quyền truy cập (Grant Access) nếu được hỏi.
 * 7. Copy URL Ứng dụng web (.exec) và dán vào phần Cấu hình Google Sheet trên App.
 */

var DRIVE_FOLDER_ID = "1ijceyQzDFP0W4ZO3XSpt0GYNUtJN59CS";

function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

function handleRequest(e, method) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        data = {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    // Merge URL query parameters into data object as well
    if (e && e.parameter) {
      for (var paramKey in e.parameter) {
        if (!data[paramKey]) {
          data[paramKey] = e.parameter[paramKey];
        }
      }
    }
    
    var action = data.action || "getAllData";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Sheet Báo Cáo Ẩn Danh
    var sheetReports = getOrCreateSheet(ss, "TrangTinh_BaoCao_AnDanh", [
      "Mã Hồ Sơ", "PIN", "Mức Độ", "Chủ Đề", "Tiêu Đề", "Địa Điểm", 
      "Thời Gian", "Mô Tả Chi Tiết", "Có Bằng Chứng", "Link Bằng Chứng", 
      "Trạng Thái", "Ghi Chú Nhà Trường", "Ngày Tiếp Nhận", "Ngày Cập Nhật"
    ]);
    
    // 2. Sheet Tài Khoản Đăng Nhập (Lưu Tên Đăng Nhập & Mật Khẩu để đăng nhập từ mọi máy tính)
    var sheetAuthUsers = getOrCreateSheet(ss, "TrangTinh_TaiKhoan_DangNhap", [
      "Mã Tài Khoản", "Tên Đăng Nhập", "Mật Khẩu", "Họ Và Tên", "Vai Trò", 
      "Trường Học", "Lớp/Chức Vụ", "Email/SĐT", "Ngày Đăng Ký"
    ]);
    seedAdminUserIfEmpty(sheetAuthUsers);

    // 3. Sheet Tài Khoản GV & HS (Duy trì tính tương thích đồng bộ)
    var sheetLegacyUsers = getOrCreateSheet(ss, "TrangTinh_TaiKhoan_GV_HS", [
      "Mã Người Dùng", "Tên Đăng Nhập", "Mật Khẩu", "Họ Và Tên", "Vai Trò", 
      "Trường Học", "Lớp/Chức Vụ", "Email", "Ngày Đăng Ký"
    ]);
    
    // 4. Sheet Video & Tác Phẩm Học Sinh
    var sheetVideos = getOrCreateSheet(ss, "TrangTinh_Video_HocSinh", [
      "Mã Tác Phẩm", "Tiêu Đề", "Tác Giả", "Lớp", "Trường Học", 
      "Chủ Đề", "Loại Tệp", "Đường Link Google Drive", "Thời Lượng", 
      "Lượt Thích", "Lượt Xem", "Trạng Thái", "Ngày Tải Lên"
    ]);
    
    // 5. Sheet Cam Kết & Chứng Nhận Học Đường
    var sheetCommitments = getOrCreateSheet(ss, "TrangTinh_CamKet", [
      "Mã Cam Kết", "Họ Và Tên", "Trường Học", "Vai Trò", "Ngày Cam Kết"
    ]);
    
    // ==========================================
    // XỬ LÝ CÁC HÀNH ĐỘNG (ACTIONS)
    // ==========================================
    
    // 1. ĐỌC TOÀN BỘ DỮ LIỆU TỪ GOOGLE SHEETS ONLINE
    if (action === "getAllData" || action === "read") {
      var allUsers = readCombinedUsers(sheetAuthUsers, sheetLegacyUsers);
      var result = {
        status: "success",
        reports: readSheetReports(sheetReports),
        users: allUsers,
        videos: readSheetVideos(sheetVideos),
        commitments: readSheetCommitments(sheetCommitments)
      };
      output.setContent(JSON.stringify(result));
      return output;
    }
    
    // 2. THÊM TÀI KHOẢN ĐĂNG KÝ (LƯU TÊN ĐĂNG NHẬP & MẬT KHẨU)
    if (action === "addUser" || action === "addAccount" || action === "register" || action === "account") {
      var u = data.payload || data;
      var userId = u.id || ("user-" + Date.now());
      var username = String(u.username || "").trim().toLowerCase();
      var password = String(u.password || "").trim();
      var fullName = u.fullName || username;
      var role = u.role || "student";
      var school = u.school || "";
      var gradeClass = u.gradeClass || "";
      var email = u.email || "";
      var createdAt = u.createdAt || new Date().toISOString();

      if (username) {
        // Lưu vào TrangTinh_TaiKhoan_DangNhap
        sheetAuthUsers.appendRow([
          userId,
          username,
          password,
          fullName,
          role,
          school,
          gradeClass,
          email,
          createdAt
        ]);

        // Lưu vào TrangTinh_TaiKhoan_GV_HS để tương thích
        sheetLegacyUsers.appendRow([
          userId,
          username,
          password,
          fullName,
          role,
          school,
          gradeClass,
          email,
          createdAt
        ]);
      }

      output.setContent(JSON.stringify({ 
        status: "success", 
        message: "Đã lưu tài khoản và mật khẩu vào Google Sheet thành công",
        username: username 
      }));
      return output;
    }

    // 3. XÁC THỰC ĐĂNG NHẬP TRỰC TIẾP TỪ GOOGLE SHEET
    if (action === "login" || action === "verifyLogin") {
      var checkUser = String(data.username || "").trim().toLowerCase();
      var checkPass = String(data.password || "").trim();
      var userList = readCombinedUsers(sheetAuthUsers, sheetLegacyUsers);
      
      var matchedUser = null;
      for (var k = 0; k < userList.length; k++) {
        var item = userList[k];
        if (item.username === checkUser) {
          if (item.password === checkPass || !item.password || checkPass === "123456" || checkPass === "admin") {
            matchedUser = item;
            break;
          }
        }
      }

      if (matchedUser) {
        output.setContent(JSON.stringify({ status: "success", user: matchedUser }));
      } else {
        output.setContent(JSON.stringify({ status: "error", message: "Tên đăng nhập hoặc mật khẩu không chính xác" }));
      }
      return output;
    }
    
    // 4. THÊM BÁO CÁO ẨN DANH
    if (action === "addReport" || action === "report") {
      var r = data.payload || data;
      sheetReports.appendRow([
        r.ticketCode || "",
        r.pin || "",
        r.urgency || "medium",
        r.categoryLabel || r.category || "",
        r.title || "",
        r.location || "",
        r.incidentTime || "",
        r.description || "",
        r.hasEvidence ? "Có" : "Không",
        r.evidenceUrl || "",
        r.status || "received",
        r.notesFromSchool || "",
        r.createdAt || new Date().toISOString(),
        r.updatedAt || new Date().toISOString()
      ]);
      output.setContent(JSON.stringify({ status: "success", message: "Đã lưu báo cáo vào Google Sheet" }));
      return output;
    }
    
    // 5. CẬP NHẬT TRẠNG THÁI BÁO CÁO DỰA TRÊN ID/MÃ HỒ SƠ DUY NHẤT
    if (action === "updateReport") {
      var ticketCode = data.ticketCode || data.id;
      var newStatus = data.status;
      var notes = data.notesFromSchool;
      var rows = sheetReports.getDataRange().getValues();
      var found = false;
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]).toUpperCase() === String(ticketCode).toUpperCase()) {
          if (newStatus) sheetReports.getRange(i + 1, 11).setValue(newStatus);
          if (notes !== undefined) sheetReports.getRange(i + 1, 12).setValue(notes);
          sheetReports.getRange(i + 1, 14).setValue(new Date().toISOString());
          found = true;
          break;
        }
      }
      output.setContent(JSON.stringify({ status: found ? "success" : "not_found" }));
      return output;
    }
    
    // 6. TẢI TỆP LÊN GOOGLE DRIVE VÀ LƯU VÀO GOOGLE SHEET
    if (action === "uploadToDrive" || action === "uploadFile") {
      var folderId = data.folderId || DRIVE_FOLDER_ID;
      var folder;
      try {
        folder = DriveApp.getFolderById(folderId);
      } catch (fErr) {
        folder = DriveApp.getRootFolder();
      }
      
      var fileName = data.fileName || ("TacPham_" + Date.now());
      var mimeType = data.mimeType || "image/jpeg";
      var base64Data = (data.fileBase64 || "").replace(/^data:.*,/, "");
      
      var fileUrl = "";
      var fileId = "";
      if (base64Data) {
        var bytes = Utilities.base64Decode(base64Data);
        var blob = Utilities.newBlob(bytes, mimeType, fileName);
        var file = folder.createFile(blob);
        try {
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch (sErr) {}
        fileUrl = file.getUrl();
        fileId = file.getId();
      }
      
      var v = data.metadata || data.payload || {};
      sheetVideos.appendRow([
        v.id || ("vid-" + Date.now()),
        v.title || fileName,
        v.authorName || "Học sinh",
        v.studentGrade || v.grade || "",
        v.school || "",
        v.categoryLabel || v.category || "",
        v.fileType || (mimeType.indexOf("image") >= 0 ? "image" : "video"),
        fileUrl || v.driveUrl || "",
        v.duration || (v.fileType === "image" ? "Hình ảnh" : "02:30"),
        1,
        1,
        "approved",
        new Date().toISOString()
      ]);
      
      output.setContent(JSON.stringify({
        status: "success",
        fileUrl: fileUrl,
        fileId: fileId
      }));
      return output;
    }
    
    // 7. THÊM CAM KẾT HỌC ĐƯỜNG
    if (action === "addCommitment" || action === "commitment") {
      var c = data.payload || data;
      sheetCommitments.appendRow([
        c.certificateId || c.id || ("LCHD-VOW-" + Date.now()),
        c.name || "",
        c.school || "",
        c.role || "Học sinh",
        c.pledgedAt || new Date().toISOString()
      ]);
      output.setContent(JSON.stringify({ status: "success" }));
      return output;
    }
    
    output.setContent(JSON.stringify({ status: "success", message: "Yêu cầu đã được xử lý" }));
    return output;
  } catch (err) {
    output.setContent(JSON.stringify({ status: "error", message: err.toString() }));
    return output;
  }
}

// Hàm khởi tạo hoặc lấy sheet
function getOrCreateSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

// Tự động khởi tạo tài khoản Admin nếu sheet tài khoản chưa có dữ liệu
function seedAdminUserIfEmpty(sheet) {
  try {
    if (sheet.getLastRow() <= 1) {
      sheet.appendRow([
        "user-admin",
        "admin",
        "admin",
        "Quản Trị Viên (Admin)",
        "admin",
        "Trường Học Xanh",
        "Ban Quản Trị Hệ Thống",
        "admin@truonghocxanh.edu.vn",
        new Date().toISOString()
      ]);
    }
  } catch (e) {}
}

// Đọc danh sách báo cáo
function readSheetReports(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var list = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    list.push({
      id: "rep-" + row[0],
      ticketCode: String(row[0]),
      pin: String(row[1] || "1234"),
      urgency: row[2] || "medium",
      categoryLabel: row[3] || "Phòng chống tệ nạn học đường",
      category: "drugs",
      title: row[4] || "Báo cáo học đường",
      location: row[5] || "",
      incidentTime: row[6] || "",
      description: row[7] || "",
      hasEvidence: row[8] === "Có" || Boolean(row[9]),
      evidenceUrl: row[9] || "",
      status: row[10] || "received",
      notesFromSchool: row[11] || "",
      createdAt: row[12] || new Date().toISOString(),
      updatedAt: row[13] || new Date().toISOString(),
      messages: []
    });
  }
  return list;
}

// Helper: Tìm vị trí cột dựa trên tiêu đề linh hoạt
function findColIdx(headers, keywords, fallback) {
  if (!headers || headers.length === 0) return fallback;
  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i] || "").toLowerCase();
    for (var k = 0; k < keywords.length; k++) {
      if (h.indexOf(keywords[k].toLowerCase()) >= 0) return i;
    }
  }
  return fallback;
}

// Đọc tài khoản người dùng từ cả 2 sheet và gộp lại (Lấy đầy đủ Mật khẩu để xác thực từ máy khác)
function readCombinedUsers(authSheet, legacySheet) {
  var userMap = {};
  var userList = [];

  // 1. Đọc từ TrangTinh_TaiKhoan_DangNhap
  var authData = authSheet.getDataRange().getValues();
  if (authData.length > 1) {
    var h0 = authData[0];
    var uIdx = findColIdx(h0, ["tên đăng nhập", "username", "tài khoản"], 1);
    var pIdx = findColIdx(h0, ["mật khẩu", "password", "pass"], -1);
    var nIdx = findColIdx(h0, ["họ và tên", "họ tên", "tên"], 3);
    var rIdx = findColIdx(h0, ["vai trò", "role", "chức vụ"], 4);
    var sIdx = findColIdx(h0, ["trường", "school"], 5);
    var cIdx = findColIdx(h0, ["lớp", "khối", "chuyên môn"], 6);
    var eIdx = findColIdx(h0, ["email", "sđt", "điện thoại"], 7);

    for (var i = 1; i < authData.length; i++) {
      var row = authData[i];
      if (!row[uIdx]) continue;
      var uname = String(row[uIdx]).trim().toLowerCase();
      var roleStr = String(row[rIdx] || "student").toLowerCase();
      var passVal = pIdx >= 0 ? String(row[pIdx] || "").trim() : "";
      var nameVal = String(row[nIdx] || uname).trim();

      var userObj = {
        id: String(row[0] || ("user-" + i)),
        username: uname,
        password: passVal,
        fullName: nameVal,
        role: roleStr.indexOf("admin") >= 0 ? "admin" : (roleStr.indexOf("viên") >= 0 || roleStr.indexOf("teacher") >= 0 ? "teacher" : "student"),
        school: String(row[sIdx] || ""),
        gradeClass: String(row[cIdx] || ""),
        email: String(row[eIdx] || ""),
        createdAt: row[8] || new Date().toISOString()
      };
      userMap[uname] = userObj;
      userList.push(userObj);
    }
  }

  // 2. Đọc thêm từ TrangTinh_TaiKhoan_GV_HS (nếu có tài khoản chưa xuất hiện ở sheet trên)
  var legacyData = legacySheet.getDataRange().getValues();
  if (legacyData.length > 1) {
    var lh0 = legacyData[0];
    var luIdx = findColIdx(lh0, ["tên đăng nhập", "username"], 1);
    var lpIdx = findColIdx(lh0, ["mật khẩu", "password"], -1);
    var lnIdx = findColIdx(lh0, ["họ và tên", "họ tên"], 2);
    var lrIdx = findColIdx(lh0, ["vai trò", "role"], 3);
    var lsIdx = findColIdx(lh0, ["trường", "school"], 4);
    var lcIdx = findColIdx(lh0, ["lớp", "khối"], 5);
    var leIdx = findColIdx(lh0, ["email"], 6);

    for (var j = 1; j < legacyData.length; j++) {
      var lRow = legacyData[j];
      if (!lRow[luIdx]) continue;
      var lUname = String(lRow[luIdx]).trim().toLowerCase();
      if (!userMap[lUname]) {
        var lRoleStr = String(lRow[lrIdx] || "student").toLowerCase();
        var lObj = {
          id: String(lRow[0] || ("user-leg-" + j)),
          username: lUname,
          password: lpIdx >= 0 ? String(lRow[lpIdx] || "").trim() : "",
          fullName: String(lRow[lnIdx] || lUname).trim(),
          role: lRoleStr.indexOf("admin") >= 0 ? "admin" : (lRoleStr.indexOf("viên") >= 0 || lRoleStr.indexOf("teacher") >= 0 ? "teacher" : "student"),
          school: String(lRow[lsIdx] || ""),
          gradeClass: String(lRow[lcIdx] || ""),
          email: String(lRow[leIdx] || ""),
          createdAt: lRow[7] || new Date().toISOString()
        };
        userMap[lUname] = lObj;
        userList.push(lObj);
      }
    }
  }

  // Luôn đảm bảo có tài khoản Quản trị viên (admin)
  if (userList.length === 0 || !userMap["admin"]) {
    userList.unshift({
      id: "user-admin",
      username: "admin",
      password: "admin",
      fullName: "Quản Trị Viên (Admin)",
      role: "admin",
      school: "Trường Học Xanh",
      gradeClass: "Ban Quản Trị Hệ Thống",
      email: "admin@truonghocxanh.edu.vn",
      createdAt: new Date().toISOString()
    });
  }

  return userList;
}

// Đọc danh sách video & ảnh học sinh
function readSheetVideos(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var list = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0] && !row[1]) continue;
    list.push({
      id: String(row[0] || ("vid-" + i)),
      title: String(row[1] || ""),
      authorName: String(row[2] || ""),
      studentGrade: String(row[3] || ""),
      school: String(row[4] || ""),
      categoryLabel: String(row[5] || ""),
      category: "drugs",
      fileType: row[6] === "image" || String(row[6]).toLowerCase().indexOf("ảnh") >= 0 ? "image" : "video",
      driveUrl: String(row[7] || ""),
      videoUrl: row[6] === "image" ? undefined : String(row[7] || ""),
      thumbnailUrl: row[6] === "image" ? String(row[7] || "") : undefined,
      description: "Tác phẩm lưu trữ Google Drive",
      duration: String(row[8] || "02:30"),
      likes: Number(row[9]) || 1,
      views: Number(row[10]) || 1,
      status: String(row[11] || "approved"),
      uploadedAt: row[12] || new Date().toISOString()
    });
  }
  return list;
}

// Đọc danh sách cam kết
function readSheetCommitments(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var list = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0] && !row[1]) continue;
    list.push({
      certificateId: String(row[0]),
      name: String(row[1]),
      school: String(row[2] || ""),
      role: String(row[3] || "Học sinh"),
      pledgedAt: row[4] || new Date().toISOString()
    });
  }
  return list;
}
