import { ReactNode, ElementType, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";

interface Props {
  Element: ElementType;
  children?: ReactNode;
  verification: boolean;
  needToBeLoggedOut?: boolean;
}

function AuthGuard({
  Element,
  children,
  verification,
  needToBeLoggedOut = false,
}: Props) {
  const { userSid } = useSelector((state: RootState) => state.auth);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    setIsLogged(!!userSid);
  }, [userSid]);

  return (
    <>
      {needToBeLoggedOut && isLogged ? (
        <Navigate to="/" replace />
      ) : !verification || isLogged ? (
        children ? (
          <Element>{children}</Element>
        ) : (
          <Element />
        )
      ) : (
        <Navigate to="/signin" replace />
      )}
    </>
  );
}

export default AuthGuard;
