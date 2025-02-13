import { environment } from "src/environments/environment";
import { AuthGuard } from "./auth.guard";
import { AuthGuardWithoutKeyCloak } from "./auth-without-keycloak.guard";

const Auth = environment.enable_keycloak ? AuthGuard : AuthGuardWithoutKeyCloak;

export { Auth };