import { Router } from "express";
import * as controller from "../controllers/contactsController.js";

const router = Router();

router.get("/", controller.list);
router.post("/", controller.create);
router.get("/:id", controller.getOne);
router.put("/:id", controller.put);
router.patch("/:id/favorite", controller.favorite);
router.patch("/:id", controller.patch);
router.delete("/:id", controller.remove);

export default router;
