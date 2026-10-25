/*
This component renders the binary confusion table used on the evaluation page.
Rows are the expected labels and columns are the method's predictions.
*/

/** Display one method's actual-versus-predicted counts. */
export default function ConfusionTable({ title, confusion }) {
  return (
    <div className="confusion-card">
      <h3>{title}</h3>
      <p>Rows: actual · columns: predicted</p>
      <table className="confusion-table">
        <thead><tr><th>Actual</th><th>{confusion.labels[0]}</th><th>{confusion.labels[1]}</th></tr></thead>
        <tbody>
          <tr><th>{confusion.labels[0]}</th><td>{confusion.cells[0][0]}</td><td>{confusion.cells[0][1]}</td></tr>
          <tr><th>{confusion.labels[1]}</th><td>{confusion.cells[1][0]}</td><td>{confusion.cells[1][1]}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
