const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const authController = require("../controllers/auth");

const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt; // cookiesde ki jwt adında ki token kodunu token değişkenine gönder.
  try {
    if (!token) {
      // token boş ise..
      return res.status(401).redirect("/login");
    }
    const decrypt = jwt.verify(token, process.env.JWTSECRETKEY); // cookiesde ki token kodu ile oluşturduğumuz secretkeyle kontrol et.
    req.user = {
      firstname: decrypt.username,
    };
  } catch (err) {
    return res.status(500).json(err.toString());
  }
};

router.get("/login", (req, res) => {
  res.render("dangnhap");
});

router.get("/kho", (req, res) => {
  res.render("kho");
});

router.get("/themnhanvien", (req, res) => {
  res.render("qlnhanvien");
});
router.get("/themmenu", (req, res) => {
  res.render("qlmenu");
});
router.get("/nhacungcap", (req, res) => {
  res.render("nhacungcap");
});
router.get("/loaihang", (req, res) => {
  res.render("loaihang");
});

router.get("/doanhthu1", (req, res) => {
  res.render("qldoanhthu");
});

router.get("/suahanghoa/:MaHH", authController.suahanghoa);
router.get("/suanhacungcap1/:MaNcc", authController.suanhacungcap1);

router.get("/hiennhanvien", authController.hiennhanvien);
router.get("/hienmenu", authController.hienmenu);
router.get("/hienkho", authController.hienkho);
router.get("/hiennhacungcap", authController.hiennhacungcap);
router.get("/hiennhacungcap1", authController.hiennhacungcap1);
router.get("/hienloaihang", authController.hienloaihang);
// router.get("/hienloaihang1", authController.hienloaihang1);

router.get("/xoahanghoa/:MaHH", authController.xoahanghoa);
router.get("/xoaloaihang/:TenLh", authController.xoaloaihang);
router.get("/xoanhacungcap/:MaNcc", authController.xoanhacungcap);
router.get("/xoanhanvien/:MaNv", authController.xoanhanvien);

router.get("/doanhthu", authController.doanhthu);
router.get("/auth/login", authController.doanhthutrangchu);

module.exports = router;
