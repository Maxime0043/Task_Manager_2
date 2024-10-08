import { ReactNode, ElementType, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { infoUser } from "../app/actions/authActions";

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
  const { loading, userSid } = useSelector((state: RootState) => state.auth);
  const dispatch: AppDispatch = useDispatch();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    dispatch(infoUser());
    setIsLogged(!!userSid);
  }, [userSid, dispatch]);

  return (
    <>
      {loading && !needToBeLoggedOut ? (
        <p>Loading...</p>
      ) : needToBeLoggedOut && isLogged ? (
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
