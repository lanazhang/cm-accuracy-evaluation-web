import React, { useState, useEffect } from 'react';
import {Cards, Container, Box, Button, Badge, Header, Pagination, ColumnLayout, Spinner, ButtonDropdown, Link, Toggle, TextFilter} from '@cloudscape-design/components';
import {ModerationCategories, TypeFilterValue, ConfidenceValue} from '../resources/data-provider';
import { FetchData } from "../resources/data-provider";
import Slider from '@mui/material/Slider';

const PAGE_SIZE = 15;

function TaskImages ({selectedTask, onBack}) {
    const [task, setTask] = useState(selectedTask);
    const [images, setImages] = useState(null);
    const [filteredImages, setFilteredImages] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState(null); // null, LOADING, LOADED
    const [currentPageIndex, setCurrentPageIndex] = React.useState(1);
    const [currentImages, setCurrentImages] = useState(null);

    const [topCategoryFilter, setTopCategoryFilter] = useState(null);
    const [subCategoryFilter, setSubCategoryFilter] = useState(null);
    const [typeFilter, setTypeFilter] = useState(null);
    const [confidenceThreshold, setConfidenceThreshold] = useState(null);
    const [subCategories, setSubCategories] = useState(null);
    const [showUnflag, setShowUnflag] = useState(false);
    const [showUnflagToggle, setShowUnflagToggle] = useState(false);

    const [filterText, setFilterText] = useState(null);

      useEffect(() => {
        // Auto refresh 
        if (loadingStatus === null) {
            const queryParams = new URLSearchParams(window.location.search);
            setShowUnflagToggle(queryParams.get("unflag"));
            
            reloadImages(showUnflag);
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

      function reloadImages(unflag=false) {
        
        setLoadingStatus("LOADING");
        FetchData(unflag?'/report/images-unflag':'/report/images', 'post', {
            id: task.id,
            top_category: topCategoryFilter,
            sub_category: subCategoryFilter,
            type: typeFilter,
            confidence_threshold: confidenceThreshold,
          }).then((data) => {
              var j = JSON.parse(data.body);
              setImages(j);
              filterImagesByText(j,filterText);
              setCurrentImages(getCurrentPageImages(j));
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
        if (parseInt(e.target.value) == confidenceThreshold)
          return;
        setConfidenceThreshold(parseInt(e.target.value));
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
        setFilterText(null);
        setShowUnflagToggle(false);
      }

      const handlePaginationChange = e => {
        setCurrentPageIndex(e.detail.currentPageIndex);
        setCurrentImages(getCurrentPageImages(images, e.detail.currentPageIndex));
      }

      function filterImagesByText(all_images=null,text=null) {
        if (text === null)
          text = filterText;
        if (all_images === null)
          all_images = Object.assign({}, images);

        let result = [];
        // filter by name
        if (text !== null && text.length > 0) {
          all_images.forEach((i) => {
            if (i.file_path.toLowerCase().includes(text.toLowerCase())) {
              result.push(i);
            }
            return result;
          }, result)                
          console.log(result.length);
          setFilteredImages(result);
          setCurrentImages(getCurrentPageImages(result));
        }
        else {
          setFilteredImages(all_images);
          setCurrentImages(getCurrentPageImages(all_images));
        }        
      }

      const handleFilterChange = e => {
        setFilterText(e.detail.filteringText.trim());
        filterImagesByText(images, e.detail.filteringText.trim());
      }

    const Filter = () => (
        <div>
        <ColumnLayout columns="1" variant="text-grid">
          <Box float='right'>
                {loadingStatus === "LOADING"?<Spinner />
                :<div /> } 
           &nbsp;<Button variant="normal" onClick={handleReset} disabled={topCategoryFilter === null && subCategoryFilter === null && typeFilter === null && confidenceThreshold === null && currentPageIndex == 1 && (filterText === null || filterText.length === 0) } >Reset</Button>    
           &nbsp;<Button variant="primary" onClick={onBack}>Back to list</Button>
          </Box>
        </ColumnLayout>
        <Container float='left'>
        <ColumnLayout columns="4" variant="text-grid">
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
          <ButtonDropdown
            onItemClick={handleSubCategoryItemClick}
            items={subCategories !== null? subCategories: []}
            expandableGroups
          >
            {subCategoryFilter === null? "Filter secondary level category": subCategoryFilter}
          </ButtonDropdown> 
          <ButtonDropdown
            onItemClick={handleTypeItemClick}
            items={TypeFilterValue}
            expandableGroups
          >
            {typeFilter === null? "Filter by review result": TypeFilterValue.find(t => t.id == typeFilter).text}
          </ButtonDropdown>  
          <div>
        Select confidence threshold: <br/>
        <Slider style={{width:200}}
          defaultValue={50} 
          value={confidenceThreshold}
          min={50} max={100} 
          size="medium" 
          step="1" 
          marks={[
            {
              value: 50,
              label: "50%",
            },
            {
              value: 75,
              label: "75%",
            },
            {
              value: 100,
              label: "100%",
            },
          ]}
          aria-label="Default" 
          valueLabelDisplay="auto"
          valueLabelFormat={value => <div>{value + '%'}</div>}
          onChange={handleConfidenceItemClick}/>
        </div> 
        </ColumnLayout>
        <ColumnLayout columns="1" variant="text-grid">
          {showUnflagToggle?
          <div>
            <br/>
          <Toggle
            onChange={({ detail }) =>
              {
                setShowUnflag(detail.checked);
                reloadImages(detail.checked);
              }
            }
            checked={showUnflag}
          >
            Show unflagged images (This is a hidden feature for debugging purposes. The page may time out to display more than 3,000 images.)
          </Toggle></div>:<div />}
          </ColumnLayout>
          </Container>
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
                filter={
                  <TextFilter filteringPlaceholder="Find images by file name" filteringText={filterText} 
                      onChange={handleFilterChange} />
                }
                loadingText="Loading images"
                empty={
                    <Box textAlign="center" color="inherit">
                    <b>No images</b>
                    <Box
                        padding={{ bottom: "s" }}
                        variant="p"
                        color="inherit"
                    >
                        No images to display.
                    </Box>
                    </Box>
                }
                header={<Header>Images flagged by Rekognition as inappropriate ({filteredImages === null? 0 :filteredImages.length})</Header>}
                pagination={
                    <Pagination
                      currentPageIndex={currentPageIndex}
                      onChange={handlePaginationChange}
                      pagesCount={filteredImages !== null?Math.ceil(filteredImages.length/PAGE_SIZE,0): 1}
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
                      pagesCount={filteredImages !== null?Math.ceil(filteredImages.length/PAGE_SIZE,0): 1}
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