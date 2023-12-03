const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const bodyPass = require("body-parser");

const app = express();

// MySQL Connection
const dB = mysql.createConnection({
  host: process.env.DB_HOSTNAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

dB.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("MYSQL Connected!");
  }
});

exports.kho = (req, res) => {
  console.log(req.body);

  const { maHH, maNcc, maLh, tenHh, giaSp, ghichu, soluong } = req.body;

  dB.query(
    "SELECT MaHH FROM hanghoa WHERE MaHH = ?",
    [maHH],
    async (error, results) => {
      if (error) {
        console.log(error);
      }

      if (results && results.length > 0) {
        return res.render("kho", {
          message: "Mã đã tồn tại",
        });
      }
      if (!maHH || !maNcc || !maLh || !tenHh || !giaSp || !ghichu || !soluong) {
        return res.render("kho", {
          message: "Vui lòng điền đầy đủ thông tin",
        });
      }

      dB.query(
        "INSERT INTO hanghoa SET ?",
        {
          MaHH: maHH,
          MaNcc: maNcc,
          MaLh: maLh,
          TenHh: tenHh,
          GiaSp: giaSp,
          Ghichu: ghichu,
          Soluong: soluong,
        },
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            console.log(results);
            return res.render("kho", {
              message: "Thêm hàng thành công !",
              Title: "Hien thi kho",
            });
          }
        }
      );
    }
  );
};
exports.themnhanvien = (req, res) => {
  console.log(req.body);

  const { manv, tennv, tendn, matkhau, sdt, diachi, chucvu } = req.body;

  dB.query(
    "SELECT MaNv FROM nhanvien WHERE MaNv = ?",
    [manv],
    async (error, results) => {
      if (error) {
        console.log(error);
      }

      if (results && results.length > 0) {
        return res.render("qlnhanvien", {
          message: "Mã vn đã tồn tại",
        });
      }
      if (!manv || !tennv || !matkhau || !tendn || !sdt || !diachi || !chucvu) {
        return res.render("qlnhanvien", {
          message: "Vui lòng điền đầy đủ thông tin ql nhan vien",
        });
      }

      dB.query(
        "INSERT INTO nhanvien SET ?",
        {
          MaNv: manv,
          TenNv: tennv,
          TenDn: tendn,
          Matkhau: matkhau,
          Sdt: sdt,
          Diachi: diachi,
          Chucvu: chucvu,
        },
        (error, results) => {
          if (error) {
            console.log(error);
          } else {
            console.log(results);
            return res.render("qlnhanvien", {
              message: "Thêm nhân viên thành công !",
            });
          }
        }
      );
    }
  );
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).render("dangnhap", {
      message: "Please provide a username and password!",
    });
  }

  dB.query(
    "SELECT * FROM nhanvien WHERE TenDn = ? AND Matkhau = ?",
    [username, password],
    async (error, results) => {
      if (error) {
        console.error("Database error:", error);
        // Xử lý lỗi cơ sở dữ liệu và đưa ra thông báo lỗi cho người dùng
        return res.status(500).render("dangnhap", {
          message: "An error occurred while processing your request.",
        });
      }

      if (results.length === 0) {
        // Không tìm thấy người dùng với tên đăng nhập và mật khẩu này
        return res.status(401).render("dangnhap", {
          message: "Username or Password is incorrect!",
        });
      }

      // Lấy thông tin chức vụ của người dùng từ kết quả truy vấn
      const userRole = results[0].Chucvu;

      if (userRole === "1") {
        // Chấp nhận đăng nhập cho người dùng với chức vụ "admin"
        const dbUsername = results[0].Username;

        const token = jwt.sign({ dbUsername }, process.env.JWTSECRETKEY);
        res.cookie("jwt", token, { maxAge: 20000, httpOnly: true });

        // req.session.successMessageDisplayed = true;
        // Truyền thông báo qua URL parameter
        const successMessage = "Login successful! Welcome, Admin.";
        return res.status(200).render("trangchu", {
          successMessage,
        });
      } else {
        // Từ chối đăng nhập cho người dùng không có quyền
        return res.status(403).render("dangnhap", {
          message: "Bạn không đủ thẩm quyền để truy cập",
        });
      }
    }
  );
};

exports.hienkho = (req, res) => {
  let successMessage = null;
  const message = successMessage;

  dB.query("SELECT * FROM hanghoa", (err, results, fields) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return;
    }
    // Xử lý kết quả dữ liệu ở đây
    console.log("Dữ liệu từ cơ sở dữ liệu kho:", results);

    // Hiển thị trang HTML với dữ liệu từ cơ sở dữ liệu
    res.render("hienthikho", { hanghoa: results, message: "Xóa thành công !" });
  });
};
//hiện menu
exports.hienmenu = (req, res) => {
  let successMessage = null;
  const message = successMessage;

  dB.query("SELECT * FROM menu", (err, results, fields) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return;
    }
    // Xử lý kết quả dữ liệu ở đây
    console.log("Dữ liệu từ cơ sở dữ liệu menu:", results);

    // Hiển thị trang HTML với dữ liệu từ cơ sở dữ liệu
    res.render("hienmenu", { menu: results, message: "Xóa thành công !" });
  });
};
exports.hiensuamenu = (req, res) => {
  let successMessage = null;
  const message = successMessage;

  dB.query("SELECT * FROM menu", (err, results, fields) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return;
    }
    // Xử lý kết quả dữ liệu ở đây
    console.log("Dữ liệu từ cơ sở dữ liệu menu:", results);

    // Hiển thị trang HTML với dữ liệu từ cơ sở dữ liệu
    res.render("suamenu", { menu: results, message: "sửa thành công !" });
  });
};
exports.xoahanghoa = (req, res) => {
  const maHangHoa = req.params.MaHH; // Lấy mã hàng hóa từ đường dẫn URL

  // Thực hiện truy vấn SQL DELETE để xóa hàng hóa từ CSDL
  const sql = "DELETE FROM hanghoa WHERE MaHH = ?";

  dB.query(sql, [maHangHoa], (error, results) => {
    if (error) {
      console.error("Lỗi khi xóa hàng hóa:", error);
      // Xử lý lỗi nếu cần
      successMessage = "Xóa hàng hóa thất bại.";
    } else {
      // Xóa thành công, có thể cập nhật giao diện người dùng, ví dụ: loại bỏ hàng từ danh sách hàng hóa.
      successMessage = "Xóa hàng hóa thành công.";
    }
    return res.redirect("/hienkho");
  });
};
exports.hiennhanvien = (req, res) => {
  dB.query("SELECT * FROM nhanvien", (err, results, fields) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return;
    }
    // Xử lý kết quả dữ liệu ở đây
    console.log("Dữ liệu từ cơ sở dữ liệu nhanvien:", results);

    // Hiển thị trang HTML với dữ liệu từ cơ sở dữ liệu
    res.render("hienthithongtinnv", { nhanvien: results });
  });
};
exports.hienmenu = (req, res) => {
  dB.query("SELECT * FROM menu", (err, results, fields) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return;
    }
    // Xử lý kết quả dữ liệu ở đây
    console.log("Dữ liệu từ cơ sở dữ liệu menu:", results);

    // Hiển thị trang HTML với dữ liệu từ cơ sở dữ liệu
    res.render("hienmenu", { menu: results });
  });
};
exports.themmenu = (req, res) => {
  console.log(req.body);

  const { mamn, tenmn, gia } = req.body;

  // dB.query('SELECT MaNv FROM nhanvien WHERE MaNv = ?', [manv], async (error, results) => {
  //     if(error){
  //         console.log(error);
  //     }

  //     if(results && results.length > 0){
  //         return res.render('qlnhanvien', {
  //             message: 'Mã vn đã tồn tại'
  //         })

  //     }
  if (!mamn || !tenmn || !gia) {
    return res.render("qlmenu", {
      message: "Vui lòng điền đầy đủ thông tin ql menu",
    });
  }

  dB.query(
    "INSERT INTO menu SET ?",
    { MaMn: mamn, TenLh: tenmn, Giatien: gia },
    (error, results) => {
      if (error) {
        console.log(error);
      } else {
        console.log(results);
        return res.render("qlmenu", {
          message: "Thêm menu thành công !",
        });
      }
    }
  );
};
exports.xoamenu = (req, res) => {
  const maMenu = req.params.MaMn; // Lấy mã hàng hóa từ đường dẫn URL

  // Thực hiện truy vấn SQL DELETE để xóa hàng hóa từ CSDL
  const sql = "DELETE FROM menu WHERE MaMn = ?";

  dB.query(sql, [maMenu], (error, results) => {
    if (error) {
      console.error("Lỗi khi xóa Menu:", error);
      // Xử lý lỗi nếu cần
      successMessage = "Xóa Menu thất bại.";
    } else {
      // Xóa thành công, có thể cập nhật giao diện người dùng, ví dụ: loại bỏ hàng từ danh sách hàng hóa.
      successMessage = "Xóa Menu thành công.";
    }
    return res.redirect("/hienmenu");
  });
};
