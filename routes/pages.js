const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authController = require('../controllers/auth');



const verifyToken =  (req, res, next) => { 
    const token = req.cookies.jwt // cookiesde ki jwt adında ki token kodunu token değişkenine gönder.
    try {
      if (!token) { // token boş ise..
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




// Routers  
router.get('/', (req,res) =>{ 
    
    verifyToken(req,res);
    res.render('trangchu')
})

router.get('/login', (req,res) =>{ 
    res.render('dangnhap')
})

router.get('/kho', (req,res) =>{
    res.render('kho')
})
// router.get('/auth/login', (req,res) =>{
//   res.render('trangchu')
// })
router.get('/themnhanvien', (req,res) =>{
  res.render('qlnhanvien')
})
router.get('/themmenu', (req,res) =>{
  res.render('qlmenu')
})
router.get('/doanhthu1', (req,res) =>{
  res.render('qldoanhthu')
})



router.get('/hienkho', authController.hienkho);
router.get('/xoahanghoa/:MaHH', authController.xoahanghoa);
router.get('/hiennhanvien', authController.hiennhanvien);
router.get('/hienmenu', authController.hienmenu);
router.get('/doanhthu', authController.doanhthu);
router.get('/trangchu', authController.doanhthutrangchu);





module.exports = router;