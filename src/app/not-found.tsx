import SiteLayout from "./(site)/layout";
import NotFound, {metadata} from "./(site)/not-found";

/**
 * URLs that match no route. Without this file Next answers them with its bare built-in 404; the
 * `(site)` not-found page only covers `notFound()` calls made inside that group. Same page, same
 * site chrome, so a visitor on a dead link still has the navigation and search.
 */
export {metadata};

export default function RootNotFound() {
  return (
    <SiteLayout>
      <NotFound />
    </SiteLayout>
  );
}
