import { combineReducers, configureStore } from "@reduxjs/toolkit";
import news from "./news/news";
import functionalArea from "./functionalArea/functionalArea";
import residentalArea from "./residentalArea/residentalArea";
import role from "./role/role";
import subDivision from "./subDivision/subDivision";
import division from "./division/division";
import positionGroup from "./positionGroup/positionGroup";
import department from "./department/department";
import project from "./project/project";
import position from "./position/position";
import gender from "./gender/gender";
import adminApplicationUser from "./adminApplicationUser/adminApplicationUser";
import getAllTargetGroups from "./getAllTargetGroups/getAllTargetGroups";
import newsCategory from "./newsCategory/newsCategory";
import notification from "./notification/notification";
import user from "./user/userSlice";
import annoucement from "./announcement/announcement";
import event from "./event/event";
import vacancy from "./vacancy/vacancy";
import course from "./course/courseSlice";
import certificate from "./certificate/certificateSlice";
import cluster from "./cluster/clusterSlice";
import courseContent from "./courseContent/courseContentSlice";
import quiz from "./quiz/quizSlice";
import courseTag from "./courseTag/courseTagSlice";
import courseCategory from "./courseCategory/courseCategorySlice.js";

const combinedReducers = combineReducers({
  news,
  quiz,
  cluster,
  certificate,
  courseContent,
  courseCategory,
  courseTag,
  course,
  functionalArea,
  residentalArea,
  role,
  subDivision,
  division,
  positionGroup,
  department,
  project,
  position,
  gender,
  adminApplicationUser,
  getAllTargetGroups,
  newsCategory,
  user,
  notification,
  annoucement,
  event,
  vacancy,
});

export const store = configureStore({
  reducer: combinedReducers,
});
