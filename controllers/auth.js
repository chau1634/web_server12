const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const bodyPass = require("body-parser");

const app = express();
app.use(
  session({
    secret: "your-secret-key", // Replace with a secret key for session encryption
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000, // Session timeout in milliseconds (1 hour in this example)
    },
  })
);
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
  const { username, tenNv, role } = req.session.user || {};
  console.log(req.body);
  console.log("Dữ liệu từ cơ sở dữ liệu nhanvien2:", tenNv);

  const { maHH, maNcc, maLh, tenHh, giaSp, ghichu, soluong } = req.body;

  dB.query(
    "SELECT MaHH FROM hanghoa WHERE MaHH = ?",
    [maHH],
    async (errorSelect, resultsSelect) => {
      if (errorSelect) {
        console.error("Error selecting from database:", errorSelect);
        return res.status(500).send("Internal Server Error");
      }

      if (resultsSelect && resultsSelect.length > 0) {
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
          TenLh: maLh,
          TenHh: tenHh,
          GiaSp: giaSp,
          Ghichu: ghichu,
          Soluong: soluong,
        },
        (errorInsert, resultsInsert) => {
          if (errorInsert) {
            return res.render("kho", {
              message: "Vui lòng chọn nhà cung cấp, loại hàng",
            });
          } else {
            console.log(resultsInsert);
            return res.render("kho", {
              message: "Thêm hàng thành công!",
              Title: "Hien thi kho",
              tenNv: [tenNv],
            });
          }
        }
      );
    }
  );
};
exports.capNhatNhanVien = (req, res) => {
  console.log(req.body);

  const { manv, tennv, tendn, matkhau, sdt, diachi, chucvu } = req.body;

  if (!manv || !tennv || !tendn || !matkhau || !sdt || !diachi || !chucvu) {
    return res.render("edittnhanvien", {
      message: "Vui lòng điền đầy đủ thông tin",
    });
  }

  dB.query(
    "UPDATE nhanvien SET TenNv=?, TenDn=?, Matkhau=?, Sdt=?, Diachi=?, Chucvu=? WHERE MaNv=?",
    [tennv, tendn, matkhau, sdt, diachi, chucvu, manv],
    (error, results) => {
      if (error) {
        console.log(error);
        return res.render("editttnhanvien", {
          message: "Cập nhật nhân viên thất bại",
        });
      } else {
        console.log(results);
        return res.render("editttnhanvien", {
          message: "Cập nhật nhân viên thành công !",
          Title: "Hien thi danh sách nhân viên",
        });
      }
    }
  );
};
exports.capNhatMenu = (req, res) => {
  console.log(req.body);

  const { maMn, tenmn, giatien, tenLh } = req.body;

  if (!maMn || !tenmn || !giatien || !tenLh) {
    return res.render("suamenu", {
      message: "Vui lòng điền đầy đủ thông tin",
    });
  }

  dB.query(
    "UPDATE menu SET TenDu=?, Giatien=?, TenLh=? WHERE MaMn=?",
    [maMn, tenmn, giatien, tenLh],
    (error, results) => {
      if (error) {
        console.log(error);
        return res.render("suamenu", {
          message: "Cập nhật menu thất bại",
        });
      } else {
        console.log(results);
        return res.render("suamenu", {
          message: "Cập nhật menu thành công !",
          Title: "Hien thi danh sách menu",
        });
      }
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
        return res.status(500).render("dangnhap", {
          message: "An error occurred while processing your request.",
        });
      }

      if (results.length === 0) {
        return res.status(401).render("dangnhap", {
          message: "Username or Password is incorrect!",
        });
      }

      // Lấy thông tin chức vụ của người dùng từ kết quả truy vấn
      const userRole = results[0].Chucvu;

      if (userRole === "1") {
        // Chấp nhận đăng nhập cho người dùng với chức vụ "admin"
        const dbUsername = results[0].Username;
        const successMessage = "Login successful! Welcome, Admin.";
        return res.status(200).redirect("/auth/login");
      } else {
        return res.status(403).render("dangnhap", {
          message: "Bạn không đủ thẩm quyền để truy cập",
        });
      }
    }
  );
};

exports.hienkho = (req, res) => {
  const { username, tenNv, role } = req.session.user || {};
  console.log(req.body);
  console.log("Dữ liệu từ cơ sở dữ liệu nhanvien2:", tenNv);
  let successMessage = null;
  const message = successMessage;

  dB.query("SELECT * FROM hanghoa", (err, results, fields) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return;
    }
    // Xử lý kết quả dữ liệu ở đây
    console.log("Dữ liệu từ cơ sở dữ liệu kho:", results);

    // Hiển thị trang HTML với dữ liệu từ cơ sở dữ liệu và thông tin người dùng
    res.render("hienthikho", { hanghoa: results, tenNv: [tenNv] });
  });
};
exports.myprofile = (req, res) => {
  const { username, tenNv, role, MaNv, Sdt, Diachi, Matkhau } =
    req.session.user || {};
  console.log(req.body);
  console.log("Dữ liệu từ cơ sở dữ liệu nhanvien2:", tenNv);
  console.log("Dữ liệu từ cơ sở dữ liệu nhanvien3:", username);
  dB.query("SELECT * FROM nhanvien", (err, results, fields) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return;
    }
    // Xử lý kết quả dữ liệu ở đây
    console.log("Dữ liệu từ cơ sở dữ liệu nhanvien:", results);

    // Lấy data Hinhanh
    const Hinhanh = fields["Hinhanh"];
    console.log("Data Hinhanh:", Hinhanh);

    // Hiển thị trang HTML với dữ liệu từ cơ sở dữ liệu
    res.render("hienthikho", { hanghoa: results });
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
exports.loaihang = (req, res) => {
  console.log(req.body);

  const { tenlh, ghichu } = req.body;
  if (!tenlh) {
    return res.render("loaihang", {
      message: "Vui lòng điền đầy đủ thông tin",
    });
  }

  dB.query(
    "INSERT INTO loaihang SET ?",
    { TenLh: tenlh, Ghichu: ghichu },
    (error, results) => {
      if (error) {
        console.log(error);
      } else {
        console.log(results);
        return res.render("loaihang", {
          message: "Thêm thành công !",
          Title: "Hien thi kho",
        });
      }
    }
  );
};
exports.getLoaiHangList = (req, res) => {
  // Thực hiện truy vấn SQL để lấy danh sách loại hàng
  const sql = "SELECT TenLh FROM loaihang";

  dB.query(sql, (error, results) => {
    if (error) {
      console.error("Lỗi khi lấy danh sách loại hàng:", error);
      return res.status(500).send("Internal Server Error");
    }

    // Kết quả truy vấn thành công, gửi danh sách loại hàng về cho client
    return res.status(200).json(results);
  });
};
exports.hienloaihang = (req, res) => {
  let successMessage = null;
  const message = successMessage;

  dB.query("SELECT * FROM loaihang", (err, results, fields) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return;
    }
    // Xử lý kết quả dữ liệu ở đây
    console.log("Dữ liệu từ cơ sở dữ liệu loaihang:", results);

    // Hiển thị trang HTML với dữ liệu từ cơ sở dữ liệu
    res.render("hienloaihang", { loaihang: results });
  });
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
exports.nhacungcap = (req, res) => {
  console.log(req.body);

  const { tennc, diachi, sdt } = req.body;
  if (!tennc || !diachi || !sdt) {
    return res.render("nhacungcap", {
      message: "Vui lòng điền đầy đủ thông tin",
    });
  }

  dB.query(
    "INSERT INTO nhacungcap SET ?",
    { TenNcc: tennc, Diachi: diachi, Sdt: sdt },
    (error, results) => {
      if (error) {
        console.log(error);
      } else {
        console.log(results);
        return res.render("nhacungcap", {
          message: "Thêm thành công !",
          Title: "Hien thi kho",
        });
      }
    }
  );
};

exports.hiennhacungcap = (req, res) => {
  let successMessage = null;
  const message = successMessage;

  dB.query("SELECT * FROM nhacungcap", (err, results, fields) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return;
    }
    // Xử lý kết quả dữ liệu ở đây
    console.log("Dữ liệu từ cơ sở dữ liệu nhacungcap:", results);
    // Hiển thị trang HTML với dữ liệu từ cơ sở dữ liệu
    res.render("hiennhacungcap", { nhacungcap: results });
  });
};
exports.hiennhacungcap1 = (req, res) => {
  dB.query(
    "SELECT MaNcc, NULL AS TenLh FROM nhacungcap WHERE MaNcc IS NOT NULL UNION ALL SELECT NULL AS MaNcc, TenLh FROM loaihang WHERE TenLh IS NOT NULL;",
    (err, results, fields) => {
      if (err) {
        console.error("Lỗi truy vấn:", err);
        return;
      }

      // Xử lý kết quả dữ liệu ở đây
      console.log("Dữ liệu từ cơ sở dữ liệu nhacungcap và loaihang:", results);

      // Hiển thị trang HTML với dữ liệu từ cơ sở dữ liệu
      res.render("kho", { data: results });
    }
  );
};
// exports.hienmenu1 = (req, res) => {
//   dB.query(
//     "SELECT TenLh FROM loaihang WHERE TenLh IS NOT NULL;",
//     (err, results, fields) => {
//       if (err) {
//         console.error("Lỗi truy vấn:", err);
//         return;
//       }

//       // Xử lý kết quả dữ liệu ở đây
//       console.log("Dữ liệu từ bảng loaihang:", results);

//       // Hiển thị trang HTML với dữ liệu từ cơ sở dữ liệu
//       res.render("qlmenu", { data: results });
//     }
//   );
// };
exports.hiensuamenu1 = (req, res) => {
  dB.query(
    "SELECT TenLh FROM loaihang WHERE TenLh IS NOT NULL;",
    (err, results, fields) => {
      if (err) {
        console.error("Lỗi truy vấn:", err);
        return;
      }

      // Xử lý kết quả dữ liệu ở đây
      console.log("Dữ liệu từ bảng loaihang:", results);

      // Hiển thị trang HTML với dữ liệu từ cơ sở dữ liệu
      res.render("suamenu", { data: results });
    }
  );
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
exports.xoaloaihang = (req, res) => {
  const loaihang = req.params.TenLh; // Lấy mã hàng hóa từ đường dẫn URL

  // Thực hiện truy vấn SQL DELETE để xóa hàng hóa từ CSDL
  const sql = "DELETE FROM loaihang WHERE TenLh = ?";

  dB.query(sql, [loaihang], (error, results) => {
    if (error) {
      console.error("Lỗi khi xóa loại hàng:", error);
      successMessage = "Xóa loại hàng thất bại.";
    } else {
      // Xóa thành công, có thể cập nhật giao diện người dùng, ví dụ: loại bỏ hàng từ danh sách hàng hóa.
      successMessage = "Xóa loại hàng thành công.";
    }
    return res.redirect("/hienloaihang");
  });
};
exports.xoanhacungcap = (req, res) => {
  const nhacungcap = req.params.MaNcc; // Lấy mã hàng hóa từ đường dẫn URL

  // Thực hiện truy vấn SQL DELETE để xóa hàng hóa từ CSDL
  const sql = "DELETE FROM nhacungcap WHERE MaNcc = ?";

  dB.query(sql, [nhacungcap], (error, results) => {
    if (error) {
      console.error("Lỗi khi xóa loại hàng:", error);
      // Xử lý lỗi nếu cần
      successMessage = "Xóa loại hàng thất bại.";
    } else {
      // Xóa thành công, có thể cập nhật giao diện người dùng, ví dụ: loại bỏ hàng từ danh sách hàng hóa.
      successMessage = "Xóa loại hàng thành công.";
    }
    return res.redirect("/hiennhacungcap");
  });
};
exports.suahanghoa = (req, res) => {
  const resul = req.params.MaHH;
  const sql = "SELECT * FROM hanghoa WHERE MaHH = ?";

  dB.query(sql, resul, (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return;
    }
    // Xử lý kết quả dữ liệu ở đây
    console.log("Product: ", results);
    res.render("suahanghoa1", { product: results });
  });
};
exports.suanhanvien = (req, res) => {
  const manv = req.params.MaNv;
  const sql = "SELECT * FROM nhanvien WHERE MaNv = ?";

  dB.query(sql, manv, (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return;
    }
    // Xử lý kết quả dữ liệu ở đây
    console.log("Employee: ", results);
    res.render("editttnhanvien", { employee: results });
  });
};
exports.suamenu = (req, res) => {
  const maMn = req.params.MaMn;
  const sql = "SELECT * FROM menu WHERE MaMn = ?";

  dB.query(sql, maMn, (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return;
    }
    // Xử lý kết quả dữ liệu ở đây
    console.log("Employee: ", results);
    res.render("suamenu", { employee: results });
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

    dB.query("SELECT * FROM nhanvien", (err, results, fields) => {
      if (err) {
        console.error("Lỗi truy vấn:", err);
        return;
      }
      // Xử lý kết quả dữ liệu ở đây
      console.log("Dữ liệu từ cơ sở dữ liệu nhanvien:", results);
      // Hiển thị trang HTML với dữ liệu từ cơ sở dữ liệu
      res.render("hienthithongtinnv", {
        nhanvien: results,
        message: "Xóa thành công!",
      });
    });
  });
};

exports.xoanhanvien = (req, res) => {
  const maNhanVien = req.params.MaNv; // Lấy mã hàng hóa từ đường dẫn URL

  // Thực hiện truy vấn SQL DELETE để xóa hàng hóa từ CSDL
  const sql = "DELETE FROM nhanvien WHERE MaNv = ?";

  dB.query(sql, [maNhanVien], (error, results) => {
    if (error) {
      console.error("Lỗi khi xóa Nhân viên:", error);
      // Xử lý lỗi nếu cần
      successMessage = "Xóa Nhân viên thất bại.";
    } else {
      // Xóa thành công, có thể cập nhật giao diện người dùng, ví dụ: loại bỏ hàng từ danh sách hàng hóa.
      successMessage = "Xóa Nhân viên thành công.";
    }
    return res.redirect("/hiennhanvien");
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
exports.doanhthu = (req, res) => {
  dB.query("SELECT * FROM oder", (err, results, fields) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return;
    }

    res.render("doanhthu", { oder: results });
  });
};
exports.doanhthutrangchu = (req, res) => {
  dB.query(
    "SELECT * FROM oder",
    (errDoanhThu, resultsDoanhThu, fieldsDoanhThu) => {
      if (errDoanhThu) {
        console.error("Lỗi truy vấn doanhthu:", errDoanhThu);
        return res.status(500).json(errDoanhThu.toString());
      }

      // Xử lý kết quả dữ liệu doanhthu ở đây
      console.log("Dữ liệu từ cơ sở dữ liệu doanhthu:", resultsDoanhThu);

      dB.query(
        "SELECT * FROM nhanvien",
        (errNhanVien, resultsNhanVien, fieldsNhanVien) => {
          if (errNhanVien) {
            console.error("Lỗi truy vấn nhanvien:", errNhanVien);
            return res.status(500).json(errNhanVien.toString());
          }

          // Xử lý kết quả dữ liệu nhanvien ở đây
          console.log("Dữ liệu từ cơ sở dữ liệu nhanvien:", resultsNhanVien);

          // Hiển thị trang HTML với dữ liệu từ cơ sở dữ liệu
          res.render("trangchu", {
            doanhthu: resultsDoanhThu,
            nhanvien: resultsNhanVien,
          });
        }
      );
    }
  );
};
exports.themmenu = (req, res) => {
  const { maMn, tenmn, giatien, tenLh } = req.body;

  dB.query(
    "SELECT MaMn FROM menu WHERE MaMn = ?",
    [maMn],
    async (errorSelect, resultsSelect) => {
      if (resultsSelect && resultsSelect.length > 0) {
        return res.render("qlmenu", {
          message: "Mã đã tồn tại",
        });
      }

      if (!maMn || !tenmn || !giatien || !tenLh) {
        return res.render("qlmenu", {
          message: "Vui lòng điền đầy đủ thông tin",
        });
      }

      dB.query(
        "INSERT INTO menu SET ?",
        {
          MaMn: maMn,
          TenDu: tenmn,
          Giatien: giatien,
          TenLh: tenLh,
        },
        (errorInsert, resultsInsert) => {
          if (errorInsert) {
            return res.render("qlmenu", {
              message: "Vui lòng chọn loại hàng",
            });
          } else {
            console.log(resultsInsert);
            return res.render("qlmenu", {
              message: "Thêm Menu thành công!",
            });
          }
        }
      );
    }
  );
};

exports.capNhatHangHoa = (req, res) => {
  console.log(req.body);

  const { maHH1, maNcc1, maLh1, tenHh1, giaSp1, ghichu1, soluong1 } = req.body;

  if (
    !maHH1 ||
    !maNcc1 ||
    !maLh1 ||
    !tenHh1 ||
    !giaSp1 ||
    !ghichu1 ||
    !soluong1
  ) {
    return res.render("suahanghoa1", {
      message: "Vui lòng điền đầy đủ thông tin",
    });
  }

  dB.query(
    "UPDATE hanghoa SET MaNcc=?, TenLh=?, TenHh=?, GiaSp=?, Ghichu=?, Soluong=? WHERE MaHH=?",
    [maNcc1, maLh1, tenHh1, giaSp1, ghichu1, soluong1, maHH1],
    (error, results) => {
      if (error) {
        console.log(error);
        return res.render("suahanghoa1", {
          message: "Cập nhật hàng hóa thất bại",
        });
      } else {
        console.log(results);
        return res.render("suahanghoa1", {
          message: "Cập nhật hàng hóa thành công !",
          Title: "Hien thi kho",
        });
      }
    }
  );
};
exports.suanhacungcap = (req, res) => {
  console.log(req.body);

  const { tennc1, diachi1, sdt1, mancc1 } = req.body;

  if (!tennc1 || !diachi1 || !sdt1 || !mancc1) {
    return res.render("suanhacungcapmoi", {
      message: "Vui lòng điền đầy đủ thông tin",
    });
  }

  dB.query(
    "UPDATE nhacungcap SET TenNcc=?, Diachi=?, Sdt=? WHERE MaNcc=?",
    [tennc1, diachi1, sdt1, mancc1],
    (error, results) => {
      if (error) {
        console.log(error);
        return res.render("suanhacungcapmoi", {
          message: "Vui lòng nhập thông tin cập nhật",
        });
      } else {
        console.log(results);
        return res.render("suanhacungcapmoi", {
          message: "Cập nhật nhà cung cấp thành công !",
          Title: "Hien thi kho",
        });
      }
    }
  );
};
exports.suanhanvien = (req, res) => {
  const manv = req.params.MaNv;
  const sql = "SELECT * FROM nhanvien WHERE MaNv = ?";

  dB.query(sql, manv, (err, results) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return;
    }
    // Xử lý kết quả dữ liệu ở đây
    console.log("Employee: ", results);
    res.render("editttnhanvien", { employee: results });
  });
};
//set du liẹu đe sua
exports.suanhacungcap1 = (req, res) => {
  const maNcc = req.params.MaNcc;
  const sql = "SELECT * FROM nhacungcap WHERE MaNcc=?";
  dB.query(sql, maNcc, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).send("Internal Server Error");
    } else {
      res.render("suanhacungcapmoi", { nhacungcap1: results });
    }
  });
};

exports.changePass = (req, res) => {
  const { username, tenNv, role, MaNv, Sdt, Diachi, Matkhau } =
    req.session.user || {};
  const { oldPassword, newPassword } = req.body;

  // Check if oldPassword matches the current password
  if (oldPassword !== Matkhau) {
    return res.render("myprofile", {
      errorMessage: "Mật khẩu cũ không đúng",
    });
  }

  // Update the password in the database
  const sql = "UPDATE nhanvien SET Matkhau = ? WHERE MaNv = ?";
  dB.query(sql, [newPassword, MaNv], (err, results) => {
    if (err) {
      console.error("Error updating password:", err);
      return res.status(500).send("Internal Server Error");
    }
    return res.redirect("/hienmenu");
  });
};
