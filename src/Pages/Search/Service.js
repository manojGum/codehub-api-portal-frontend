import { gql } from "@apollo/client";

function QUERYservice(N, serviceType) {
    if (N === "1") {
        return gql`
        query Services($q: String) {
          services(
            filters: { name: { contains: $q }, status: { eq: true  }}
            sort: "id:desc"
            pagination: { start: 0, limit: 100 }
          ) {
            data {
              id
              attributes {
                publishedAt
                shortDescription
                name
                type
                authorName
                authorEmail
                repoLinks
                tags {
                  name
                }
              }
            }
            meta {
              pagination {
                page
                pageSize
                pageCount
                total
              }
            }
          }
        }
      `
    } else if (N === "2") {
        return gql`
        query Services($q: String) {
          services(
            filters: { name: { contains: $q }, type: { eq: "${serviceType}" }, status: { eq: true  }}
            sort: "id:desc"
            pagination: { start: 0, limit: 100 }
          ) {
            data {
              id
              attributes {
                publishedAt
                shortDescription
                name
                type
                authorName
                authorEmail
                repoLinks
                tags {
                  name
                }
              }
            }
            meta {
              pagination {
                page
                pageSize
                pageCount
                total
              }
            }
          }
        }
      `
    }
}

function QUERYendpoint() {
    return gql`
  query endpointMasters($q: String) {
    endpointMasters(
      filters: { name: { contains: $q }}
      pagination: { page: 1, pageSize: 10 }
    ) {
      data {
        id
        attributes {
          publishedAt
          shortDescription
          name
          method
        }
      }
      meta {
        pagination {
          page
          pageSize
          pageCount
          total
        }
      }
    }
  }
`}

export { QUERYservice, QUERYendpoint }