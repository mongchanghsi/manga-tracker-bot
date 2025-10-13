import { Router } from "express";
import { testComick, testMangaDex, testOthers } from "./controller";

const router: Router = Router();

router.get("/test-mangadex", testMangaDex);
router.get("/test-comick", testComick);
router.get("/test-others", testOthers);

export default router;
