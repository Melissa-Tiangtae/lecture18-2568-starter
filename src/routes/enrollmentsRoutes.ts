import { Router, type Request, type Response } from "express";
import {
  zCourseId,
  zStudentId,
  zEnrollmentBody
} from "../libs/zodValidators.js";

import type { Student, Enrollment, CustomRequest } from "../libs/types.js";


// import database
import { enrollments,reset_enrollments,users,students } from "../db/db.js";
import {authenticateToken}from "../middlewares/authenMiddleware.js";
import { checkRoleAdmin } from "../middlewares/checkRoleAdminMiddleware.js";
import { checkRoles } from "../middlewares/checkRolesMiddleware.js";
const router = Router();


// GET /api/v2/enrollments
// get enrollments (by program)

router.get("/", authenticateToken,checkRoleAdmin,(req: CustomRequest, res: Response) => {
  try {
   
      return res.status(200).json({
        success: true,
        message: "Enrollments Information",
        data: enrollments,
      });
    
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /api/v2/enrollments/reset

router.post("/reset",authenticateToken, checkRoleAdmin, (req: CustomRequest, res: Response) => {
  try {
    reset_enrollments();
    return res.status(200).json({
      success: true,
      message: "enrollments database has been reset"
    })
  }catch(err){
   return res.status(500).json({
    success: false,      
    message: "Something is wrong, please try again",
    error: err,
  }); 
  }
});


// GET /api/v2/enrollments/{studentId}
// search data (enrollments)
router.get(
  "/:studentId",
  authenticateToken,
  checkRoles,
  (req: CustomRequest, res: Response) => {
    try {
  
      // 1. get "user payload" from (custom) request
      const payload = (req as CustomRequest).user;

      // 2. get "studentId" from endpoint param and validate with Zod
      const studentId = req.params.studentId;
      const parseResult = zStudentId.safeParse(studentId);
    

    if (payload?.role === "ADMIN" || (payload?.role === "STUDENT" && payload?.studentId === studentId)) {
      const studentEnrollments = students.filter((watch)=> watch.studentId === studentId);
      return res.status(200).json({
        success: true,
        message: "Student Information",
        data: studentEnrollments,
      });
    }

    return res.status(403).json({
        success: false,
        message: "Forbidden access"
    })

  }catch(err){
   return res.status(500).json({
    success: false,      
    message: "Something is wrong, please try again",
    error: err,
  }); 
  }
});
 
// POST /api/v2/enrollments/:studentId

router.post("/:studentId", authenticateToken, checkRoles, (req: CustomRequest, res: Response) => {
  try {
    const studentId = zStudentId.parse(req.params.studentId);
   // const body = req.body as Enrollment;
    const courseId = zCourseId.parse(req.body.courseId);
    const user = (req as CustomRequest).user;

    //  const result = zEnrollmentBody.safeParse(req.body); // check zod
    // if (!result.success) {
    //   return res.status(400).json({
    //     message: "Validation failed",
    //     errors: result.error.issues[0]?.message,
    //   });
      
    // }

// ตรรกะ: บล็อก ADMIN และ STUDENT ที่ทำรายการให้คนอื่น
    if (user?.role === "ADMIN" || (user?.role === "STUDENT" && user?.studentId !== studentId)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden access",
      });
    }
 const existing = enrollments.find(e => e.studentId === studentId && e.courseId === courseId);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "studentId & courseId already exists",
      });
    }

    // push enrollment
    const enrollment = { studentId, courseId };
    enrollments.push(enrollment);

    return res.status(201).json({
      success: true,
      message: `Student ${studentId} & Course ${courseId} has been added successfully`,
      data: { studentId, courseId },
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err,
    });
  }
});

//DELETE
//DELETE /api/v2/enrollments/:studentId ใ

router.delete("/DELETE", authenticateToken, checkRoles, (req: CustomRequest, res: Response) => {
  try {
   const studentId = zStudentId.parse(req.params.studentId);
    const courseId = zCourseId.parse(req.body.courseId);
    const user = (req as CustomRequest).user;

        if (user?.role === "ADMIN" || (user?.role === "STUDENT" && user?.studentId !== studentId)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to modify another student's data",
      });
    }

    const Enindex = enrollments.findIndex(thisen => thisen.studentId === studentId && thisen.courseId === courseId);
    if (Enindex === -1) {
      return res.status(404).json({
        success: false,
        message: "Enrollment does not exist",
      });
    }

    enrollments.splice(Enindex, 1);

    return res.status(200).json({
      success: true,
      message: `Student ${studentId} & Course ${courseId} has been deleted successfully`,
      data: { studentId, courseId },
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err,
    });
  }
});




export default router;

