export default function Issuers() {
    return (
        <div>
            <h1 className="text-2xl font-bold">Issuers</h1>
            <table className="mt-4 w-full">
                <thead>
                <tr>
                    <th>Issuer</th>
                    <th>Last Trade</th>
                    <th>Volume</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>ALK</td>
                    <td>290.00</td>
                    <td>100</td>
                </tr>
                </tbody>
            </table>
        </div>
    );
}