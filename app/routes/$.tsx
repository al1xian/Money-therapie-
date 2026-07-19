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
    <div className="not-found-page">
      <p className="not-found-page__code">404</p>
      <h1>Page introuvable</h1>
      <p>Cette page n&rsquo;existe pas ou plus.</p>
      <Link to="/" className="btn btn--outline">
        Retour à l&rsquo;accueil
      </Link>
    </div>
  );
}
