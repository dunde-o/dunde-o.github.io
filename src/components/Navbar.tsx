import { NavLink } from "@/components/NavLink";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <NavLink 
            to="/" 
            className="text-xl font-bold bg-gradient-to-r from-primary to-[hsl(var(--hero-gradient-to))] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            Portfolio
          </NavLink>
          
          <div className="flex items-center gap-8">
            <NavLink
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors relative group"
              activeClassName="text-primary"
            >
              Projects
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </NavLink>
            
            <NavLink
              to="/about"
              className="text-muted-foreground hover:text-foreground transition-colors relative group"
              activeClassName="text-primary"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
