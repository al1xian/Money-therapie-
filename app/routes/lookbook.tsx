import type {Route} from './+types/lookbook';

export const meta: Route.MetaFunction = () => {
  return [{title: 'money therapy | lookbook'}];
};

// Placeholder tiles — replace with real campaign imagery when available.
const TILES = Array.from({length: 6}, (_, i) => `look-placeholder-${i + 1}`);

export default function Lookbook() {
  return (
    <div className="page page--wide">
      <h1>lookbook</h1>
      <div className="lookbook-grid">
        {TILES.map((tile) => (
          <div key={tile} className="lookbook-grid__tile" aria-hidden="true">
            {tile}
          </div>
        ))}
      </div>
    </div>
  );
}
