// middleware/uploadMiddleware.ts

import multer from 'multer'

const storage = multer.memoryStorage() // Storing the file in memory; you might want to upload this to a cloud storage later

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 7 * 1024 * 1024, // limiting files size to 7 MB
  },
})

export default upload
