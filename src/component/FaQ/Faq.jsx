import React, { useState } from "react";
import { TabPane } from "reactstrap";
import { useQuery, gql } from "@apollo/client";
import "./Faq.css";
import md from "markdown-it";
import img1 from "../../Assets/images/No records.png"
import parse from "html-react-parser";
const QUERY = gql`
  query Faqs($slug: String, $page: Int, $pageSize: Int) {
    faqs(
      filters: {
        or: [
          { serviceMasters: { slug: { eq: $slug } } }
          { endpointMasters: { slug: { eq: $slug } } }
        ]
      }
      pagination: { page: $page, pageSize: $pageSize }
    ) {
      data {
        id
        attributes {
          question
          answer
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
`;

const Faq = ({ slug }) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // const setPageNo = (e) => {
  //   setPage(e);
  // };

  const { data, loading, error } = useQuery(QUERY, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: { slug, page, pageSize },
  });

  if (loading) {
    // return <Loading />;
  }

  if (error) {
    return null;
  }

  const faqs = data?.faqs?.data;

  if (faqs?.length !== 0) {
    return (
      <>
        <TabPane tabId="2" style={{ paddingTop: "20px" }}>
          <div className="faq-body">
            <div className="faq-list">
              {faqs ?
                faqs?.map((e, i) => {
                  return (
                    <div key={i}>
                      <details open>
                        <summary title={e.attributes.question}>
                          {e.attributes.question}
                        </summary>
                        {e.attributes.answer ? (
                          <div
                            className="faq-content sidedesign"                           
                          >{e.attributes.answer}</div>
                        ) : null}
                      </details>
                      {/* // if details accordion not better then comment details and used below Accordion */}
                      {/* <Accordion 
                        title={e.attributes.question}
                        content={e.attributes.answer?e.attributes.answer:null}/> */}
                    </div>
                  );
                }) : null}
            </div>
            {/* <Pagination
              activePage={page}
              itemsCountPerPage={pageSize}
              totalItemsCount={data.faqs.meta.pagination.total}
              onChange={setPageNo}
              pageRangeDisplayed={3}
              nextPageText="Next"
              prevPageText="Prev"
              firstPageText="First"
              lastPageText="Last"
              itemClass="page-item"
              linkClass="page-link"
              activeClass="active"
              activeLinkClass="active"
              innerClass="pagination justify-content-center"
            /> */}
          </div>
        </TabPane>
      </>
    );
  } else {
    return (
      <>
        <TabPane tabId="2">
          <div className="NoDataFoundDiv">
            <img src={img1} className="NoDataFoundImg" alt="" style={{ textAlign: "center" }} />
            <h1 className="NoDataFound" >No Data Found!</h1>
          </div>
        </TabPane>
      </>
    );
  }
};

export default Faq;
