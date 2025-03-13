import { combineReducers, configureStore } from "@reduxjs/toolkit";
import news from "./news/news";
import course from "./course/course";
import courseCategory from "./courseCategory/courseCategory";
import functionalArea from "./functionalArea/functionalArea";
import courseTag from "./courseTag/courseTag";
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
import courseReducer from "./course/courseSlice";
import notification from "./notification/notification";
import user from "./user/userSlice";
import annoucement from "./announcement/announcement";
import event from "./event/event";

const combinedReducers = combineReducers({
  news,
  course,
  courseCategory,
  courseTag,
  courseReducer,
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
});

export const store = configureStore({
  reducer: combinedReducers,
});
