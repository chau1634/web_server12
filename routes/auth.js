const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
  
// Routers  
router.post('/login', authController.login)
router.post('/kho', authController.kho)
router.post('/themnhanvien', authController.themnhanvien)
router.post('/themmenu', authController.themmenu)
router.post('/doanhthu1', authController.doanhthu)
router.post('/auth/login', authController.doanhthutrangchu)
// router.get('/nhienkho', authController.hienkho);



module.exports = router;