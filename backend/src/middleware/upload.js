const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const createStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads', folder);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const isValid = allowed.test(path.extname(file.originalname).toLowerCase()) &&
                  allowed.test(file.mimetype.split('/')[1]);
  isValid ? cb(null, true) : cb(new Error('Only image files are allowed!'), false);
};

const limits = { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 };

exports.uploadComplaintImages = multer({ storage: createStorage('complaints'), fileFilter, limits }).array('images', 5);
exports.uploadMarketplaceImages = multer({ storage: createStorage('marketplace'), fileFilter, limits }).array('images', 5);
exports.uploadLostFoundImages = multer({ storage: createStorage('lost-found'), fileFilter, limits }).array('images', 3);
exports.uploadProfilePhoto = multer({ storage: createStorage('profiles'), fileFilter, limits }).single('photo');