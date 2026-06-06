import { configureAuth } from "@limbu/shared/session";
import { auth } from "@/auth";

configureAuth(() => auth());
