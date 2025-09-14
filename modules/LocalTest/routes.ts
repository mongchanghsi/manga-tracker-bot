import { Router } from "express";
import { testComick, testMangaDex } from "./controller";

const router: Router = Router();

router.get("/test-mangadex", testMangaDex);
router.get("/test-comick", testComick);

export default router;
