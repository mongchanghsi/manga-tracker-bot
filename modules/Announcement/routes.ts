import { Router } from "express";
import { announce, sendMessages, testAnnounce } from "./controller";

const router: Router = Router();

router.post("/announcement", announce);
router.post("/test-announcement", testAnnounce);
router.post("/send-message", sendMessages);

export default router;
