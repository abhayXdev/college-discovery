async function getColleges() {
  const res = await fetch("http://localhost:3000/api/colleges", {
    cache: "no-store",
  });

  return res.json();
}

export default async function Home() {
  const colleges = await getColleges();

  return (
    <main style={{ padding: "20px" }}>
      <h1>College Finder</h1>

      <table
        border={1}
        cellPadding={10}
        style={{
          borderCollapse: "collapse",
          width: "100%",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>City</th>
            <th>State</th>
            <th>Score</th>
          </tr>
        </thead>

        <tbody>
          {colleges.map((college: any) => (
            <tr key={college.id}>
              <td>{college.rank}</td>
              <td>{college.name}</td>
              <td>{college.city}</td>
              <td>{college.state}</td>
              <td>{college.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}