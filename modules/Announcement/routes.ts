import { Router } from "express";
import { announce, testAnnounce } from "./controller";

const router: Router = Router();

router.post("/announce", announce);
router.post("/test-announce", testAnnounce);

export default router;
