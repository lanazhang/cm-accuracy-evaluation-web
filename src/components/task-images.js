import React, { useState, useEffect } from 'react';
import {Cards, Container, Box, Button, Badge, Header, Pagination, ColumnLayout, Spinner, ButtonDropdown, Link, Alert} from '@cloudscape-design/components';
import {ModerationCategories, TypeFilterValue, ConfidenceValue} from '../resources/data-provider';
import { FetchData } from "../resources/data-provider";

const PAGE_SIZE = 15;

function TaskImages ({selectedTask, onBack}) {
    const [task, setTask] = useState(selectedTask);
    const [images, setImages] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState(null); // null, LOADING, LOADED
    const [currentPageIndex, setCurrentPageIndex] = React.useState(1);
    const [currentImages, setCurrentImages] = useState(null);

    const [topCategoryFilter, setTopCategoryFilter] = useState(null);
    const [subCategoryFilter, setSubCategoryFilter] = useState(null);
    const [typeFilter, setTypeFilter] = useState(null);
    const [confidenceThreshold, setConfidenceThreshold] = useState(null);
    const [subCategories, setSubCategories] = useState(null);
  
      useEffect(() => {
        // Auto refresh 
        if (loadingStatus === null) {
            reloadImages();
        }
      })

      function getCurrentPageImages (items, curPage=null) {
        if (curPage === null) curPage = currentPageIndex;
        if (items === null || items.length === 0) return [];
        else {
          var result = [];
          items.forEach((i, index) => {
            //console.log(index, (currentPageIndex - 1) * PAGE_SIZE, currentPageIndex * PAGE_SIZE);
            if (index >= ((curPage - 1) * PAGE_SIZE) && index < curPage * PAGE_SIZE) {
              result.push(i);
            }
            return result;
          }, result)
        }
        return result;
      }    

      function reloadImages() {
        setLoadingStatus("LOADING");
        FetchData('/report/images', 'post', {
            id: task.id,
            top_category: topCategoryFilter,
            sub_category: subCategoryFilter,
            type: typeFilter,
            confidence_threshold: confidenceThreshold,
          }).then((data) => {
              var j = JSON.parse(data.body)
              setImages(j);
              setCurrentImages(getCurrentPageImages(j))
              setLoadingStatus("LOADED");
          })
          .catch((err) => {
            console.log(err.message);
            setLoadingStatus("LOADED");
          });
      }
  
      const handleTopCategoryItemClick = e => {
        if (e.detail.id == topCategoryFilter) 
          return;
        if (e.detail.id == '-- All --')
          setTopCategoryFilter(null);
        else  
          setTopCategoryFilter(e.detail.id);
        
        // Set sub category filter
        var sub = ModerationCategories[e.detail.id].map((x) => {
          return {
              "id": x,
              "text": x
          };
        })
        setSubCategories(sub);
        setLoadingStatus(null);
        setCurrentPageIndex(1);
      }
  
      const handleSubCategoryItemClick = e => {
        console.log(e);
        if (e.detail.id == topCategoryFilter) 
          return;
        if (e.detail.id == '-- All --')
          setSubCategoryFilter(null);
        else  
          setSubCategoryFilter(e.detail.id);
        setLoadingStatus(null);
        setCurrentPageIndex(1);
      }
  
      const handleTypeItemClick = e => {
        if (e.detail.id == typeFilter)
          return;
  
        if (e.detail.id === '-')
          setTypeFilter(null);
        else
          setTypeFilter(e.detail.id);
        setLoadingStatus(null);
        setCurrentPageIndex(1);
      }
  
      const handleConfidenceItemClick = e => {
        if (parseInt(e.detail.id) == confidenceThreshold)
          return;
        setConfidenceThreshold(parseInt(e.detail.id));
        setLoadingStatus(null);
        setCurrentPageIndex(1);
      } 
  
      const handleReset = e => {
        setTopCategoryFilter(null);
        setSubCategoryFilter(null);
        setConfidenceThreshold(null);
        setTypeFilter(null);
        setLoadingStatus(null);
        setCurrentPageIndex(1);
      }

      const handlePaginationChange = e => {
        console.log(e);
        setCurrentPageIndex(e.detail.currentPageIndex);
        setCurrentImages(getCurrentPageImages(images, e.detail.currentPageIndex));
      }

    const Filter = () => (
        <div>
        <ColumnLayout columns="1" variant="text-grid">
          <Box float='right'>
                {loadingStatus === "LOADING"?<Spinner />
                :<div /> } 
           &nbsp;<Button variant="normal" onClick={handleReset} disabled={topCategoryFilter === null && subCategoryFilter === null && typeFilter === null && confidenceThreshold === null && currentPageIndex == 1} >Reset</Button>    
           &nbsp;<Button variant="primary" onClick={onBack}>Back to list</Button>
          </Box>
        </ColumnLayout>
        <ColumnLayout columns="1" variant="text-grid">
        <Container float='left'>
          <ButtonDropdown
            onItemClick={handleTopCategoryItemClick}
            items={Object.keys(ModerationCategories).map((x) => {
                        return {
                            "id": x,
                            "text": x
                        };
                      })}
            expandableGroups
          >
            {topCategoryFilter === null? "Filter top level category": topCategoryFilter}
          </ButtonDropdown>       
          &nbsp;  
          <ButtonDropdown
            onItemClick={handleSubCategoryItemClick}
            items={subCategories !== null? subCategories: []}
            expandableGroups
          >
            {subCategoryFilter === null? "Filter secondary level category": subCategoryFilter}
          </ButtonDropdown> 
          &nbsp;        
          <ButtonDropdown
            onItemClick={handleTypeItemClick}
            items={TypeFilterValue}
            expandableGroups
          >
            {typeFilter === null? "Filter by review result": TypeFilterValue.find(t => t.id == typeFilter).text}
          </ButtonDropdown>  
          &nbsp;    
          <ButtonDropdown
            onItemClick={handleConfidenceItemClick}
            items={ConfidenceValue}
            expandableGroups
          >
            {confidenceThreshold === null? "Select confidence threshold": ConfidenceValue.find(c => c.id == confidenceThreshold).text}
          </ButtonDropdown>    
          </Container>
         </ColumnLayout>
         </div>
      )

    return (
        <div>
            <Filter/>
            <br/>
            <Cards
                cardDefinition={{
                    header: item => (
                    <Link fontSize="heading-m">{item !== null?item.name:""}</Link>
                    ),
                    sections: [
                    {
                        id: "file_path",
                        header: "File name",
                        content: item => item !== null ?<Link href={item.url} external="true"> {item.file_path.split('/').at(-1)}</Link>: ""
                    },
                    {
                        id: "top_category",
                        header: "Rekognition labeled category",
                        content: item => item !== null ?item.top_category + " / " + item.sub_category: ""
                    },
                    {
                        id: "confidence",
                        header: "Rekognition confidence score",
                        content: item => item !== null ?parseFloat(item.confidence ).toFixed(2)+"%" : ""
                    },
                    {
                        id: "type",
                        header: "Human review result",
                        content: item => item !== null ?<Badge color={item.type === "false-positive"? "red": "green"}>{item.type}</Badge> : ""
                    },
                    {
                        id: "url",
                        header: "Image",
                        content: item => item !== null ? <img src={item.url} width="100%" height="auto"/>: <div/>
                    }
                    ]
                }}
                cardsPerRow={[
                    { cards: 1 },
                    { minWidth: 230, cards: 3 }
                ]}
                items={currentImages !== null?currentImages:[]}
                loadingText="Loading resources"
                empty={
                    <Box textAlign="center" color="inherit">
                    <b>No resources</b>
                    <Box
                        padding={{ bottom: "s" }}
                        variant="p"
                        color="inherit"
                    >
                        No resources to display.
                    </Box>
                    <Button>Create resource</Button>
                    </Box>
                }
                header={<Header>Images labled by Rekognition ({images === null? 0 :images.length})</Header>}
                pagination={
                    <Pagination
                      currentPageIndex={currentPageIndex}
                      onChange={handlePaginationChange}
                      pagesCount={images !== null?Math.ceil(images.length/PAGE_SIZE,0): 1}
                      ariaLabels={{
                        nextPageLabel: "Next page",
                        previousPageLabel: "Previous page",
                        pageLabel: pageNumber =>
                          `Page ${pageNumber} of all pages`
                      }}
                    />
                  }
        
                />
                <Box float='right'>
                <Pagination
                      currentPageIndex={currentPageIndex}
                      onChange={handlePaginationChange}
                      pagesCount={images !== null?Math.ceil(images.length/PAGE_SIZE,0): 1}
                      ariaLabels={{
                        nextPageLabel: "Next page",
                        previousPageLabel: "Previous page",
                        pageLabel: pageNumber =>
                          `Page ${pageNumber} of all pages`
                      }}
                    />
                </Box>
           </div>
    );
}

export {TaskImages};