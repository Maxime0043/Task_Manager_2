import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { listProjects } from "../../../app/actions/projectActions";

function NavBar_Projects() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { projects } = useSelector((state: RootState) => state.projects);
  const dispatch: AppDispatch = useDispatch();
  const limit = 10;
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    dispatch(
      listProjects({
        limit,
        offset,
        orderBy: "name",
        dir: "asc",
        managerId: user.id!,
      })
    );
  }, [dispatch, offset, user.id]);

  function loadMoreProjects() {
    setOffset(projects.length);
  }

  return (
    <div id="navigation-projects">
      {projects.map((project, index) => {
        return (
          <div key={index} className="navigation-project">
            <p className="navigation-project-name">{project.name}</p>
          </div>
        );
      })}

      <button onClick={loadMoreProjects}>Afficher plus...</button>
    </div>
  );
}

export default NavBar_Projects;
