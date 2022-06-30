import multer from "multer";
import path from "path";
import { getEnv } from "../enviroment";

getEnv();
const {MODE, PATH_ADDS} = process.env;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = MODE === 'PROD' ? path.join(process.cwd(), 'build', 'static', PATH_ADDS || '') :
                                      path.join(process.cwd(), 'src', 'public', PATH_ADDS || ''); 
        cb(null, dir)
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `${Date.now()}.${ext}`)
    }
});
  
export default multer({ 
    storage: storage, 
    fileFilter: (req, file, callback) => {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 1024 * 1024
    }
})

