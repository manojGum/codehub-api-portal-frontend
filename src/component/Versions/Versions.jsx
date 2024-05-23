import { useQuery, gql } from "@apollo/client";
import "./Version.css";
import Moment from "react-moment";
import { TabPane } from "reactstrap";

const QUERY = gql`
  query Service($slug: String) {
    services(filters: { slug: { eq: $slug } }, sort: "version:desc") {
      data {
        id
        attributes {
          name
          version
          versionReleaseNotes
          publishedAt
          slug
        }
      }
    }
  }
`;

export default function VersionServices({ slug }) {
  const { data, loading, error } = useQuery(QUERY, {
    variables: { slug },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  });

  if (loading) {
    // return <Loading />;
  }

  if (error) {
    return null;
  }

  const endpoints = data?.services.data;

  return (
    <>
      <div style={{ float: "" }}>
        <TabPane tabId="4">
          <div className="pb-2 pt-3 pt-md-4 px-1">
            <p
              className="px-2 fw-bold text-blue font_cern "
              style={{ fontSize: "1.1rem" }}
            >
              Version History
            </p>
            <table className="table-hover mb-2 mt-2 w-100 table">
              <thead>
                <tr>
                  <th className="children_header">Version</th>
                  <th className="children_header">Version Release Notes</th>
                  <th className="children_header">Published</th>
                </tr>
              </thead>
              <tbody>
                {endpoints?.map((endpoint) => (
                  <tr key={endpoint.id}>
                    <td>
                      <div
                        onClick={() => {
                          localStorage.setItem("tabValue", 1);
                        }}
                        key={endpoint.id}
                        className="nav-link"
                        href={{
                          pathname: "/docs/service",
                          query: { id: endpoint.id },
                        }}
                      >
                        <code> {endpoint.attributes.version}</code>
                      </div>
                    </td>
                    <td>{endpoint.attributes.versionReleaseNotes}</td>
                    <td>
                      <Moment fromNow>{endpoint.attributes.publishedAt}</Moment>{" "}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabPane>
      </div>
    </>
  );
}
