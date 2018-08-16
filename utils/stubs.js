module.exports = {
  generator: {
    name: "New Generator",
    api: "http://api-goes-here",
    description: "New Description",
    logic: "return {}"
  },
  materializer: {
    name: "New Materializer",
    description: "New Description",
    logic: "return {}"
  },
  profile_stat: {
    title: "New Stat",
    subtitle: "New Subtitle",
    value: "New Value"
  },
  profile_description: {
    description: "New Description"
  },  
  profile_visualization: {
    logic: "return {}"
  },
  section_description: {
    description: "New Description"
  },
  section_subtitle: {
    subtitle: "New Subtitle"
  },
  topic_stat: {
    title: "New Stat",
    subtitle: "New Subtitle",
    value: "New Value"
  },
  topic_visualization: {
    logic: "return {}"
  },
  topic_description: {
    description: "New Description"
  },
  topic_subtitle: {
    subtitle: "New Subtitle"
  },
  selector: {
    options: [],
    default: "",
    name: "new-selector"
  },
  story_description: {
    description: "New Description"
  },  
  story_footnote: {
    description: "New Footnote"
  },  
  storytopic_stat: {
    title: "New Stat",
    subtitle: "New Subtitle",
    value: "New Value"
  },
  storytopic_visualization: {
    logic: "return {}"
  },
  storytopic_description: {
    description: "New Description"
  },
  storytopic_subtitle: {
    subtitle: "New Subtitle"
  },
  author: {
    name: "author name",
    title: "author title",
    image: "img",
    twitter: "twitter",
    bio: "Author Bio"
  },
  objTopic: {
    hasCaret: false,
    label: "new-topic-slug",
    itemType: "topic",
    data: {
      title: "New Topic Title",
      subtitle: "New Topic Subtitle",
      slug: "new-topic-slug",
      description: "New Topic Description",
      type: "TextViz"
    }
  },
  objSection: {
    hasCaret: true,
    label: "new-section-slug",
    itemType: "section",
    data: {
      title: "New Section Title",
      slug: "new-section-slug",
      description: "New Section Description"
    }
  },
  objProfile: {
    hasCaret: true,
    label: "new-profile-slug",
    itemType: "profile",
    data: {
      title: "New Profile Title",
      subtitle: "New Profile Subtitle",
      slug: "new-profile-slug",
      description: "New Profile Description",
      label: "New Profile Label"
    }
  },
  objStory: {
    hasCaret: true,
    label: "new-story",
    itemType: "story",
    data: {
      title: "New Story",
      image: "New Image"
    }
  },
  objStoryTopic: {
    hasCaret: false,
    label: "new-storytopic-slug",
    itemType: "storytopic",
    data: {
      title: "New StoryTopic Title",
      subtitle: "New StoryTopic Subtitle",
      slug: "new-storytopic-slug",
      description: "New StoryTopic Description",
      type: "TextViz"
    }
  }
};
