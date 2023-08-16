"use client";

import React from "react";
import { HeroSection } from "./components/hero-section/HeroSection";
import { ProjectsSection } from "./components/projects-section/ProjectsSection";
import { Skills } from "./components/skills/Skills";
import { TestimonialsSection } from "./components/testimonials-section/TestimonialsSection";
import { WorkExperienceSection } from "./components/work-experience-section/WorkExperienceSection";

import { HomePageData } from "./types/page-info";
import { GraphQLClient } from "graphql-request";

// Define metadata outside of the component
const metadata = {
    title: "Home",
};

// Define the prop type for the Home component
type InitialPageProps = {
    pageData: HomePageData | null;
};

const getPageData = async (): Promise<HomePageData | null> => {
    const query = `
    query MyQuery {
        page(where: {slug: "home"}) {
          introduction {
            raw
          }
          introductionTitle
          profilePicture {
            url
          }
          descriptionTitle
          descriptionText {
            raw
          }
          technologies {
            name
            iconSvg
            startDate
          }
          badges {
            name
          }
        }
      }
    `;

    const hygraphUrl = process.env.HYGRAPH_URL;
    const hygraphToken = process.env.HYGRAPH_TOKEN;

    if (!hygraphUrl || !hygraphToken) {
        console.error(
            "HYGRAPH_URL and/or HYGRAPH_TOKEN are not defined in the environment."
        );
        return null;
    }

    const client = new GraphQLClient(hygraphUrl, {
        headers: {
            Authorization: `Bearer ${hygraphToken}`,
        },
    });

    try {
        const data: { page: HomePageData } = await client.request(query);
        return data.page;
    } catch (error) {
        console.error("Error fetching page data:", error);
        return null;
    }
};

// Use the typed prop in the Home component

export default function Home({ pageData: initialPageData }: InitialPageProps) {
    const [pageData, setPageData] = React.useState(initialPageData);

    React.useEffect(() => {
        async function fetchData() {
            const data = await getPageData();
            setPageData(data);
        }
        if (!pageData) {
            fetchData();
        }
    }, [pageData]);

    if (!pageData) {
        return <div className="container">Loading...</div>;
    }

    return (
        <>
            <HeroSection homeInfo={pageData?.page || null} />
            <Skills tech={pageData?.page?.technologies || null} />
            <ProjectsSection />
            <TestimonialsSection />
            <WorkExperienceSection />
        </>
    );
}
