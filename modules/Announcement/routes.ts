import { Router } from "express";
import { announce, testAnnounce } from "./controller";

const router: Router = Router();

router.post("/announcement", announce);
router.post("/test-announcement", testAnnounce);

export default router;
