const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
  
// Routers  
router.post('/login', authController.login)
router.post('/kho', authController.kho)
router.post('/themnhanvien', authController.themnhanvien)
router.post('/themmenu', authController.themmenu)
<<<<<<< HEAD
router.post('/nhacungcap', authController.nhacungcap)
router.post('/loaihang', authController.loaihang)
=======
router.post('/doanhthu1', authController.doanhthu)
router.post('/auth/login', authController.doanhthutrangchu)
// router.get('/nhienkho', authController.hienkho);
>>>>>>> 534e82f31851119a8165f6632140dfb6ff334804



module.exports = router;