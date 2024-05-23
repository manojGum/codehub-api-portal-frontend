import { gql } from "@apollo/client";

function author() {
  return gql`
    usersPermissionsUsers {
      data{
        id
        attributes{
        email
        username
      }
    }
  }
`
}
function allData() {
  return gql`
  query Services($q: String) {
    services(
      filters: { name: { contains: $q }, status: { eq: true  }}
      sort: "id:desc"
      pagination: { start: 0, limit: 3 }
    ) {
      data {
        id
        attributes {
          publishedAt
          description
          name
          status
          type
          slug
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

function serviceType(service, serviceType) {
  return gql`
  query Service($page: Int, $pageSize: Int) {
    ${service}( 
      filters: { 
        type: { eq: "${serviceType}" }
        services: { status: { eq: true } }
     }
      pagination: { page: $page, pageSize: $pageSize 
      }) {
      data {
        id
        attributes {
          name
          slug
          services{
            data{
              id
              attributes{
                status
              }
            }
          }
        }
      }
      meta {
        pagination {
          page
          pageSize
          total
          pageCount
        }
      }
    }
  }
`
}

function RowData() {
  return gql`
  query Services($q: String) {
    services(
      filters: { name: { contains: $q }}
      pagination: { start: 0, limit: 3 }
    ) {
      data {
        id
        attributes {
          publishedAt
          description
          name
          status
          type
          slug
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

function underReviewer() {
  return gql`
  query Services($q: String) {
    services(
      filters: { name: { contains: $q }, status: { eq: false  }, reviewerEmail: {notNull: true}}
      pagination: { start: 0, limit: 3 }
    ) {
      data {
        id
        attributes {
          publishedAt
          description
          name
          status
          type
          slug
          reviewerEmail
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
function published() {
  return gql`
  query Services($q: String) {
    services(
      filters: { name: { contains: $q }, status: { eq: true  }}
      pagination: { start: 0, limit: 3 }
    ) {
      data {
        id
        attributes {
          publishedAt
          description
          name
          status
          type
          slug
          reviewerEmail
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

function serviceTypeServices(service, serviceType) {
  return gql`
  query Service($page: Int, $pageSize: Int) {
    ${service}(
      sort: "id:desc" 
      filters: { type: { eq: "${serviceType}" } , status: {eq:true}}
      pagination: { page: $page, pageSize: $pageSize 
      }) {
      data {
        id
        attributes {
          name
          shortDescription
          slug
          status
        }
      }
      meta {
        pagination {
          page
          pageSize
          total
          pageCount
        }
      }
    }
  }
`
}

export { serviceType, serviceTypeServices, allData, author, underReviewer, RowData, published }