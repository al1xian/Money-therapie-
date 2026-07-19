import type {Route} from './+types/guide-des-tailles';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Money Therapy | Guide des tailles'}];
};

const ROWS = ['XS', 'S', 'M', 'L', 'XL'];
const COLUMNS = ['Tour de poitrine (cm)', 'Longueur (cm)', 'Tour de taille (cm)'];

export default function SizeGuide() {
  return (
    <div className="info-page">
      <h1>Guide des tailles</h1>
      <p className="info-page__intro">
        Le tableau de mesures précis de chaque pièce sera complété prochainement.
        En attendant, contactez-nous via la page{' '}
        <a href="/contact">Contact</a> pour toute question sur une coupe.
      </p>
      <div className="size-table-wrap">
        <table className="size-table">
          <thead>
            <tr>
              <th>Taille</th>
              {COLUMNS.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row}>
                <td>{row}</td>
                {COLUMNS.map((col) => (
                  <td key={col}>—</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
