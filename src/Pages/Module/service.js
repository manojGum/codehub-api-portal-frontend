import { gql } from "@apollo/client";

function serviceType(service, serviceType){
  return gql`
  query Service($page: Int, $pageSize: Int) {
    ${service}(
      filters: { type: { eq: "${serviceType}" }, services:{ status: { eq: true } } }
      sort: "id:desc"
      pagination: { page: $page, pageSize: $pageSize 
      }) {
      data {
        id
        attributes {
          name          
          slug
          publishedAt
          services{
            data{
              id
              attributes{
                status
                description
                authorName   
                authorEmail             
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
//, status: { eq: true } 
function serviceTypeServices(service, serviceType){
  return gql`
  query Service($page: Int, $pageSize: Int) {
    ${service}(
      filters: { type: { eq: "${serviceType}" },status: { eq: true } }
      sort: "id:desc"
      pagination: { page: $page, pageSize: $pageSize 
      }) {
      data {
        id
        attributes {
          name
          description
          slug
          status
          authorName
          authorEmail
          publishedAt
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

function userData(email){
  return gql`
  query Service($page: Int, $pageSize: Int) {
    services(
      filters: { authorEmail: { eq: "${email}" }, status: { eq: true } }
      sort: "id:desc"
      pagination: { page: $page, pageSize: $pageSize 
      }) {
      data {
        id
        attributes {
          name
          description
          slug
          type
          status
          authorName
          authorEmail
          publishedAt
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


export { serviceType, serviceTypeServices, userData}