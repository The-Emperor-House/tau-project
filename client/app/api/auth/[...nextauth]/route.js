import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// ฟังก์ชัน refresh access token
async function refreshAccessToken(token) {
  // console.log('🔄 Attempting to refresh access token...');
  // console.log('📦 Current refresh token:', token.refreshToken);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    const data = await res.json();
    // console.log('✅ Refresh token API response:', data);

    if (!res.ok || data.status !== "success" || !data.data?.accessToken) {
      console.error("❌ Refresh failed:", data);
      return { ...token, error: "RefreshAccessTokenError" };
    }

    const expiresInRaw = data.data.accessTokenExpiresIn || "2h";
    let expiresInMs = 2 * 60 * 60 * 1000;

    if (expiresInRaw.endsWith("s")) {
      expiresInMs = parseInt(expiresInRaw) * 1000;
    } else if (expiresInRaw.endsWith("m")) {
      expiresInMs = parseInt(expiresInRaw) * 60 * 1000;
    } else if (expiresInRaw.endsWith("h")) {
      expiresInMs = parseInt(expiresInRaw) * 60 * 60 * 1000;
    } else if (expiresInRaw.endsWith("d")) {
      expiresInMs = parseInt(expiresInRaw) * 24 * 60 * 60 * 1000;
    }

      return {
        ...token,
        backendToken: data.data.accessToken,
        tokenExpiresIn: data.data.accessTokenExpiresIn,
        refreshToken: data.data.refreshToken ?? token.refreshToken,
        accessTokenExpires: Date.now() + expiresInMs,
      };
    } catch (err) {
    // console.error("⚠️ Error while refreshing:", err);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              rememberMe: credentials.rememberMe ? true : false,
            }),
          });

          const data = await res.json();

          if (res.ok && data.status === "success" && data.data?.user) {

            const accessTokenExpiresInSeconds = data.data.accessTokenExpiresIn; // เช่น '30s' หรือ '2h'
      
            // แปลง String เวลา เช่น "30s" เป็นตัวเลขวินาที (seconds)
            let expiresInMs;
            if (accessTokenExpiresInSeconds.endsWith('s')) {
                expiresInMs = parseInt(accessTokenExpiresInSeconds) * 1000;
            } else if (accessTokenExpiresInSeconds.endsWith('m')) {
                expiresInMs = parseInt(accessTokenExpiresInSeconds) * 60 * 1000;
            } else if (accessTokenExpiresInSeconds.endsWith('h')) {
                expiresInMs = parseInt(accessTokenExpiresInSeconds) * 60 * 60 * 1000;
            } else if (accessTokenExpiresInSeconds.endsWith('d')) {
                expiresInMs = parseInt(accessTokenExpiresInSeconds) * 24 * 60 * 60 * 1000;
            } else {
                // Fallback ในกรณีที่รูปแบบไม่ตรงตามที่คาดหวัง
                expiresInMs = 2 * 60 * 60 * 1000; // 2 ชั่วโมง
            }

            return {
              id: data.data.user.userId,
              name: data.data.user.name,
              email: data.data.user.email,
              avatarUrl: data.data.user.avatarUrl,
              backendToken: data.data.accessToken,
              tokenExpiresIn: data.data.accessTokenExpiresIn,
              refreshToken: data.data.refreshToken,
              accessTokenExpires: Date.now() + expiresInMs,
            };
          }

          return null;
        } catch (error) {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // 🔐 กรณี login ใหม่
      if (user) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          backendToken: user.backendToken,
          tokenExpiresIn: user.tokenExpiresIn,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires || Date.now() + 2 * 60 * 60 * 1000,
        };
      }

      // ⏳ ตรวจว่าหมดอายุหรือยัง
      if (Date.now() >= (token.accessTokenExpires ?? 0)) {
          // console.log("⌛ Access token expired. Refreshing...");
          return await refreshAccessToken(token);
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        avatarUrl: token.avatarUrl,
      };

      session.backendToken = token.backendToken;
      session.tokenExpiresIn = token.tokenExpiresIn;
      // refreshToken อยู่ใน JWT cookie (httpOnly, เข้ารหัส) ฝั่ง server เท่านั้น — ไม่ส่งให้ browser
      session.accessTokenExpires = token.accessTokenExpires;
      session.error = token.error ?? null;

      return session;
    },
  },

  events: {
    // revoke refresh token ที่ backend ตอน logout — ทำฝั่ง server เพราะ browser ไม่มี refresh token แล้ว
    async signOut({ token }) {
      if (!token?.refreshToken) return;
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: token.refreshToken }),
        });
      } catch (err) {
        console.error("Backend logout failed:", err);
      }
    },
  },

  pages: {
    signIn: "/auth/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };
