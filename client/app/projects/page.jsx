import ProjectCards from '../home/components/ProjectCards';
import { Toolbar } from "@mui/material";

export default function ProjectsPage() {
  return (
   <div style={{ 
    paddingTop: "var(--nav-h, 80px)",
    backgroundColor: "var(--bg-color, #404040)",
  }}>
      <Toolbar sx={{ mb: 2 }} />
      <ProjectCards />
    </div>
  );
}