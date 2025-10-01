import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import type { User, CustomRequest, UserPayload } from "../libs/types.js";
import { authenticateToken } from "../middlewares/authenMiddleware.js";
import { checkRoleAdmin } from "../middlewares/checkRoleAdminMiddleware.js";
// import database
import { users, reset_users } from "../db/db.js";
import { success } from "zod";

const router = Router();

// GET /api/v2/users
// router.get("/", (req: Request, res: Response) => {
//   try {

//    //get AUT header
//         const  authHeader = req.headers["authorization"]
//         console.log(authHeader)

//         if(!authHeader || !authHeader.startsWith("Bearer")){
//             return res.status(401).json({
//                 success: false,
//                 message: "Authorization header is not found"
//             })
//         }

//          //extract token ออกมาาาาาาาาา
//         const token = authHeader?.split(" ")[1]

//         if(!token){
//             return res.status(401).json({
//                 success: false,
//                 message: "Token is required"
//             });
//         }

    
//         //VERIFY

//         try{

//             const jwt_secret = process.env.JWT_SECRET || "forgot_secret";
//             jwt.verify(token,jwt_secret,(err,payload)=>{
            
//                 if (err){
//                     return res.status(403).json({
//                         success: false,
//                         message: "Invalid or expired token"
//                     })
//                 }
//                  const user = users.find(
//             (u:User) => u.username === (payload as UserPayload).username 
//         );
//           }  )

//         }catch(err){


//         }


//     // return all users
//     return res.json({
//       success: true,
//       data: users,
//     });
//   } catch (err) {
//     return res.status(200).json({
//       success: false,
//       message: "Something is wrong, please try again",
//       error: err,
//     });
//   }
// });

// GET /api/v2/users (ADMIN only)
router.get("/", authenticateToken, (req: Request, res: Response) => {
  try {
    // After the Request has been processed by 'authenticateToken' middleware
    // 1. Get "user payload" and "token" from (custom) request
    const payload = (req as CustomRequest).user;
    const token = (req as CustomRequest).token;

    // 2. check if user exists (search with username) and role is ADMIN

    // return all users
    return res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    return res.status(200).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /api/v2/users/login
router.post("/login", (req: Request, res: Response) => {


     
    try{
        
        

        // 1. get username and password from body
        const {username, password} = req.body; //เอาข้อมูลมาจากบอดี้
        const user = users.find(
            (u:User) => u.username === username && u.password === password
        );

        // 2. check if user NOT exists (search with username & password in DB)

  if(!user){
    return res.status(401).json({
        success: false,
        message: "Invalid username or password"
    });
  }

  // 3. create JWT token (with user info object as payload) using JWT_SECRET_KEY ก็คือเอายูเซอร์มาทำโทเคน
    const jwt_secret = process.env.JWT_SECRET || "forgot_secret";
    const token = jwt.sign({
        //add JWT payload
        username: user.username,
        studentId : user.studentId,
        role : user.role,

        //รับค่า,secret key for เข้ารหัส, ออพชันเพิ่มเติม

    },jwt_secret,{expiresIn : "5m"})

    res.status(200).json({
        success: true,
        message: "Login successful",
        token
    })
  
  //    (optional: save the token as part of User data)

  // 4. send HTTP response with JWT token

    }catch(err){
            return res.status(500).json({
                success: false,
                message: "Something went wrong",
                error: err
            })

    }
 

  

  return res.status(500).json({
    success: false,
    message: "POST /api/v2/users/login has not been implemented yet",
  });
});

// POST /api/v2/users/logout
router.post("/logout", (req: Request, res: Response) => {
  // 1. check Request if "authorization" header exists
  //    and container "Bearer ...JWT-Token..."

  // 2. extract the "...JWT-Token..." if available

  // 3. verify token using JWT_SECRET_KEY and get payload (username, studentId and role)

  // 4. check if user exists (search with username)

  // 5. proceed with logout process and return HTTP response
  //    (optional: remove the token from User data)

  return res.status(500).json({
    success: false,
    message: "POST /api/v2/users/logout has not been implemented yet",
  });
});

// POST /api/v2/users/reset
router.post("/reset", (req: Request, res: Response) => {
  try {
    reset_users();
    return res.status(200).json({
      success: true,
      message: "User database has been reset",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

export default router;