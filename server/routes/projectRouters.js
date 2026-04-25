import express from "express"
import {addMember, createProject, updateProject} from "../controllers/projectController.js"

const projectrouter = express.Router();

projectrouter.post('/', createProject);
projectrouter.put('/', updateProject);
projectrouter.post('/:projectId/addMember', addMember);

export default projectrouter