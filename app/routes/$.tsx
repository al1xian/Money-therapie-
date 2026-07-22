import {Link} from 'react-router';
import type {Route} from './+types/$';

export async function loader({request}: Route.LoaderArgs) {
  throw new Response(`${new URL(request.url).pathname} not found`, {
    status: 404,
  });
}

export default function CatchAllPage() {
  return null;
}

export function ErrorBoundary() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>cette page n&rsquo;existe pas ou plus.</p>
      <Link to="/" className="btn--ghost">
        retour à l&rsquo;accueil
      </Link>
    </div>
  );
}
