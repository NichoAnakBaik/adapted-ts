import { SignJWT, jwtVerify } from "jose";

const secretKey = "namsan-secret-key-for-dev-only";
const key = new TextEncoder().encode(secretKey);

async function test() {
  try {
    const jwt = await new SignJWT({ test: true })
      .setProtectedHeader({ alg: "HS256" })
      .sign(key);
      
    console.log("Sign success:", jwt);
    
    const { payload } = await jwtVerify(jwt, key, {
      algorithms: ["HS256"],
    });
    
    console.log("Verify success:", payload);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
