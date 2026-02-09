import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./AuthPage.css";
import Login from "../Login/Login";
import Signup from "../Signup/Signup";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => setIsLogin(!isLogin);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div className="Main">
      <div className="Main-Container">
        <div className="auth-header">
          <h1>{isLogin ? "Sign In" : "Join WatchHub"}</h1>
          <p>
            {isLogin ? "New to WatchHub?" : "Already have an account?"}
            <span className="toggle-text" onClick={toggleMode}>
              {isLogin ? "Sign up now" : "Sign in"}
            </span>
          </p>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {isLogin ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Login stateReset={isLogin} />
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Signup stateReset={!isLogin} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
