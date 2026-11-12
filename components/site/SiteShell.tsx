import Backdrop from "@/components/site/Backdrop";
import FxRuntime from "@/components/site/FxRuntime";
import SiteHeader from "@/components/site/SiteHeader";
import TypeLab from "@/components/site/TypeLab";
import { SiteFooter } from "@/components/site/sections";

/**
 * Page chrome shared by the home page and the article pages. Rendered per page
 * (not as a layout) so FxRuntime remounts and re-measures on every navigation.
 */
export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ed ed-page relative flex min-h-screen flex-col overflow-x-clip antialiased">
      <Backdrop />
      <FxRuntime />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ed-ink focus:px-4 focus:py-2 focus:text-ed-bg"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="relative z-10 flex-1">
        {children}
      </main>
      <div className="relative z-10">
        <SiteFooter>
          <TypeLab />
        </SiteFooter>
      </div>
    </div>
  );
}
