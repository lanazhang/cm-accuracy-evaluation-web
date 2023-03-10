import { useState, useRef } from "react";
import Header from "@cloudscape-design/components/header";
import * as React from "react";
import Alert from "@cloudscape-design/components/alert";
import {withAuthenticator} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import {Navigation, Notifications} from './components/commons/common-components';
import { AppLayout } from '@cloudscape-design/components';
import { TaskList } from "./components/task-list";
import TopNavigation from "@cloudscape-design/components/top-navigation";
import logo from './static/aws_logo.png'
import {GetStarted} from "./components/get-started";
import { BreadcrumbGroup, Link, SpaceBetween } from '@cloudscape-design/components';

const App = ({ signOut, user }) => {
  const [currentPage, setCurrentPage] = useState("getstarted");
  const [navigationOpen, setNavigationOpen] = useState(true);
  const [activeNavHref, setActiveNavHref] = useState("#/getstarted");
  const [currentBreadcrumb, setCurrentBreadcrumb] = useState([{ "type": 'label', "text": 'Home', "href": '#'}, {"id":"getstarted", "text": 'Get Started', "href": '#/getstarted', }]);
  const appLayout = useRef();

  const [selectedItems, setSelectedItems] = useState([]); 

  const handleItemClick = event => {
    setSelectedItems([]);
  }

  const onSelectionChange = event => {
    setSelectedItems(event.selectedItems);
  }

  const handleNavigationChange = () => {
    setNavigationOpen(!navigationOpen);
  }

  const handleHavItemClick = e => {
    setCurrentPage(e.detail.id);
    setActiveNavHref(e.detail.href);
    if (e.detail.id === "getstarted") {
      setCurrentBreadcrumb([{ "type": 'label', "text": 'Home'}, {"id":"dashboard", "text": 'Dashboard', }]);
      setCurrentPage("getstarted");
    }
    else {
      setCurrentBreadcrumb([{ "type": 'label', "text": 'Home'}, {"id":"dashboard", "text": 'Evaluation tasks', }]);
      setCurrentPage("task");
    }
    setCurrentPage(e.detail.id);
  }

  const handleStart = e => {
    setCurrentPage("tasks");
  }

    return (
      <div>
      <TopNavigation      
      identity={{
        href: "#",
        title: "AWS Content Moderation",
        logo: {
          src: logo,
          alt: "AWS"
        }
      }}
      utilities={[
        {
          type: "menu-dropdown",
          text: user.username,
          description: user.email,
          iconName: "user-profile",
          onItemClick: signOut,
          items: [
            { type: "button", id: "signout", text: "Sign out"}
          ]
        }
      ]}
      i18nStrings={{
        searchIconAriaLabel: "Search",
        searchDismissIconAriaLabel: "Close search",
        overflowMenuTriggerText: "More",
        overflowMenuTitleText: "All",
        overflowMenuBackIconAriaLabel: "Back",
        overflowMenuDismissIconAriaLabel: "Close menu"
      }}
    />
      <AppLayout
      headerSelector="#header"
      ref={appLayout}
      contentType="table"
      navigationOpen={navigationOpen}
      onNavigationChange={handleNavigationChange}
      navigation={
      <Navigation 
        onFollowHandler={handleHavItemClick}
        selectedItems={["getstarted"]}
        activeHref={activeNavHref}
        items={
        [
          { type: 'link', id:"getstarted", text: 'Get Started', "href": '#/getstarted', },
          { type: 'link', id:"tasks", text: 'Evaluation Tasks', "href": '#/tasks', },
          { type: 'divider' },
          {
            type: 'link', text: 'Documentation', external: true, href: 'https://github.com/lanazhang/aws-ai-cm-rek-img-accuracy-eval-cdk',
          },
        ]
      } 
      />}
      breadcrumbs={
        <BreadcrumbGroup 
          items={currentBreadcrumb}
        />
      }
      header={
        <SpaceBetween size="l">
          <Header
            variant="h1"
            info={<Link>Info</Link>}
            description="AWS AI Content Moderation - Rekognition Accuracy Evaluation."
          >
            AWS Content Moderation
          </Header>

          { alert !== null && alert.length > 0?<Alert>{alert}</Alert>:<div/>}
        </SpaceBetween>
      }
      content={
        currentPage === "tasks"?< TaskList user={user} onItemClick={handleItemClick} onSelectionChange={onSelectionChange}/>:<GetStarted onStart={handleStart} />
      }
    >
    </AppLayout>
    </div>
  );
}
export default withAuthenticator(App);
