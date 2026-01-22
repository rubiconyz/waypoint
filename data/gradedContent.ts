// Curated graded reading content for language learning
// Organized by language code and CEFR proficiency level

export interface GradedPassage {
    id: string;
    title: string;
    level: 'A1' | 'A2' | 'B1' | 'B2';
    wordCount: number;
    content: string;
    source?: string;
}

export interface LanguageLibrary {
    [languageCode: string]: GradedPassage[];
}

// Level descriptions for UI
export const LEVEL_INFO = {
    A1: { label: 'Beginner', color: 'emerald', description: 'Simple phrases and everyday expressions' },
    A2: { label: 'Elementary', color: 'blue', description: 'Routine matters and familiar topics' },
    B1: { label: 'Intermediate', color: 'purple', description: 'Main points of clear standard input' },
    B2: { label: 'Upper-Intermediate', color: 'orange', description: 'Complex texts on concrete and abstract topics' },
};

export const GRADED_CONTENT: LanguageLibrary = {
    // ENGLISH 🇬🇧
    en: [
        {
            id: 'en-a1-1',
            title: 'The Great Wall of China',
            level: 'A1',
            wordCount: 50,
            content: `The Great Wall is in China. It is very long. People build it a long time ago. They use stone and brick. The wall is strong. It helps protect the country. Today many tourists visit it. They take photos and walk on it.`
        },
        {
            id: 'en-a1-2',
            title: 'The Pyramids in Egypt',
            level: 'A1',
            wordCount: 50,
            content: `The pyramids are in Egypt. They are very old. People build them with big stones. The work is hard. Many workers help. The pyramids are very large. Today people travel to see them. They are famous in the world.`
        },
        {
            id: 'en-a1-3',
            title: 'The First Airplane',
            level: 'A1',
            wordCount: 60,
            content: `Two brothers live in the USA. They are the Wright brothers. They want to fly. They build a small airplane. One day it flies for a short time. People are surprised. Later, airplanes become very important. Today we fly to many countries.`
        },
        {
            id: 'en-a1-4',
            title: 'The Titanic',
            level: 'A1',
            wordCount: 55,
            content: `The Titanic is a big ship. It sails in 1912. Many people are on the ship. One night it hits an iceberg. The ship sinks. Many people are very sad. This event is very famous. People still talk about it.`
        },
        {
            id: 'en-a1-5',
            title: 'A Famous Painter: Vincent van Gogh',
            level: 'A1',
            wordCount: 60,
            content: `Vincent van Gogh is a painter. He lives in Europe. He paints many pictures. His colors are very strong. He is not famous at first. Later, people love his art. Today his paintings are in museums. Many people know his name.`
        },
        {
            id: 'en-a1-6',
            title: 'The First Moon Landing',
            level: 'A1',
            wordCount: 50,
            content: `In 1969, people watch TV. Astronauts go to the Moon. Neil Armstrong walks on the Moon. It is a big moment. Many people feel excited. The world talks about it. It is history. People remember it today.`
        },
        {
            id: 'en-a1-7',
            title: 'The Berlin Wall Falls',
            level: 'A1',
            wordCount: 50,
            content: `Berlin has a wall for many years. The wall divides the city. Families are separated. In 1989, people want freedom. They go to the wall. They celebrate together. The wall falls. Berlin becomes one city again.`
        },
        {
            id: 'en-a1-8',
            title: 'The Olympic Games',
            level: 'A1',
            wordCount: 50,
            content: `The Olympic Games are a big sports event. Athletes come from many countries. They run, swim, and jump. They train for a long time. They want to win medals. People cheer and clap. The Olympics are very famous. Many people watch them.`
        },
        {
            id: 'en-a1-9',
            title: 'The Eiffel Tower',
            level: 'A1',
            wordCount: 50,
            content: `The Eiffel Tower is in Paris. It is very tall. People build it in 1889. At first, some people do not like it. Later, it becomes famous. Today many tourists visit it. They go up and see the city. It is a symbol of Paris.`
        },
        {
            id: 'en-a1-10',
            title: 'A Big Fire in London',
            level: 'A1',
            wordCount: 45,
            content: `A long time ago, there is a big fire in London. Many houses are made of wood. The fire spreads fast. People run away. Many buildings burn. Later, the city builds new houses. The fire is a famous event in history.`
        },
        {
            id: 'en-a2-1',
            title: 'Pompeii and the Volcano',
            level: 'A2',
            wordCount: 80,
            content: `Pompeii is an old city in Italy. In the year 79, a volcano called Vesuvius erupts. First, ash falls from the sky and people feel afraid. Then hot rocks and smoke cover the city. Many people try to run away, but it is very difficult. Pompeii disappears under ash for a long time. Many years later, archaeologists find the city again. Today visitors can walk on the old streets and see houses, shops, and paintings.`
        },
        {
            id: 'en-a2-2',
            title: 'Rosa Parks and the Bus',
            level: 'A2',
            wordCount: 85,
            content: `In 1955, Rosa Parks lives in Alabama, USA. One day she rides a bus and sits down. A white man wants her seat, but she says no. The police arrest her. Many people are angry because the rule is unfair. After this, people start a bus boycott and stop using the buses. The protest becomes very important. Rosa Parks becomes a symbol for civil rights and equal treatment.`
        },
        {
            id: 'en-a2-3',
            title: 'The First Telephone Call',
            level: 'A2',
            wordCount: 85,
            content: `Before telephones, people write letters or travel to talk. In the 1800s, inventors try to send voices through wires. Alexander Graham Bell works on this idea. In 1876 he makes a famous first phone call. People are surprised because they can hear a voice from another place. Soon, more homes and offices use phones. Communication becomes faster and easier, and the world starts to feel smaller.`
        },
        {
            id: 'en-a2-4',
            title: 'The First Modern Olympic Games',
            level: 'A2',
            wordCount: 80,
            content: `In 1896, the first modern Olympic Games happen in Athens, Greece. Athletes come from different countries to compete. There are sports like running, jumping, and swimming. Many people watch and cheer. The idea is to bring countries together through sport. The event is a success, so the Olympics continue every four years. Today the Olympic Games are one of the biggest events in the world.`
        },
        {
            id: 'en-a2-5',
            title: 'Amelia Earhart Flies Far',
            level: 'A2',
            wordCount: 85,
            content: `Amelia Earhart is a famous pilot from the USA. In the 1920s and 1930s, flying is still new and dangerous. Amelia wants to show that women can also be strong pilots. She flies across the Atlantic Ocean and becomes very famous. Many people admire her courage. Later she tries to fly around the world, but her plane disappears. Even today, her story is interesting and mysterious.`
        },
        {
            id: 'en-a2-6',
            title: 'The Berlin Airlift',
            level: 'A2',
            wordCount: 85,
            content: `After World War II, Berlin is divided. In 1948, the Soviet Union blocks the roads to West Berlin. People in the city need food and coal, but trucks cannot enter. The Western countries decide to bring supplies by airplane. Planes land every day and bring important things. This is called the Berlin Airlift. It lasts many months. In the end, the block ends, and the city survives.`
        },
        {
            id: 'en-a2-7',
            title: 'The Invention of the Light Bulb',
            level: 'A2',
            wordCount: 85,
            content: `In the past, people use candles and oil lamps at night. Then inventors work on electric light. Thomas Edison becomes famous because he improves the light bulb and makes it useful for homes. Electric light changes daily life. People can work and read after dark more easily. Streets also become safer with lamps. The light bulb becomes one of the most important inventions.`
        },
        {
            id: 'en-a2-8',
            title: 'The First Woman in Space',
            level: 'A2',
            wordCount: 80,
            content: `In 1963, Valentina Tereshkova becomes the first woman in space. She is from the Soviet Union. She travels in a spaceship and goes around the Earth. Many people follow the news and feel amazed. Her flight is important because it shows that women can also take part in space missions. Today she is still remembered as a pioneer.`
        },
        {
            id: 'en-a2-9',
            title: 'The Panama Canal Opens',
            level: 'A2',
            wordCount: 85,
            content: `Before the Panama Canal, ships must travel around South America to go between oceans. This takes a very long time. Engineers build a canal in Panama, but the work is hard. Many workers get sick, and the project takes years. In 1914, the canal opens. Ships can now travel faster between the Atlantic and Pacific Oceans. The canal becomes very important for world trade.`
        },
        {
            id: 'en-a2-10',
            title: 'The Great Fire of Chicago',
            level: 'A2',
            wordCount: 80,
            content: `In 1871, a big fire starts in Chicago, USA. The city has many wooden buildings, so the fire spreads quickly. People run away and try to save their things. Many homes and streets burn. After the fire, the city is rebuilt with stronger materials like brick and stone. Chicago grows again and becomes a modern city. The fire is a famous event in American history.`
        },
        {
            id: 'en-b1-1',
            title: 'The Black Death in Europe (1347–1351)',
            level: 'B1',
            wordCount: 130,
            content: `In the 1300s, a deadly disease came to Europe. People later called it the Black Death. It spread quickly through ports and busy cities, because traders and ships moved from place to place. Many people got sick with fever and painful swellings, and many died within a few days. At that time, doctors did not know about bacteria, so they could not treat it well. Some people thought the illness was a punishment, and others blamed different groups, which caused fear and violence.
When the plague ended, Europe had changed. There were fewer workers, so some workers asked for better pay. Many families lost parents and children, and villages became empty. The Black Death is remembered because it shows how one disease can change society, work, and everyday life.`
        },
        {
            id: 'en-b1-2',
            title: 'The Fall of Constantinople (1453)',
            level: 'B1',
            wordCount: 135,
            content: `Constantinople was a powerful city for many centuries. It was the center of the Byzantine Empire and a key place for trade between Europe and Asia. In 1453, the Ottoman army, led by Sultan Mehmed II, surrounded the city. The defenders had strong walls, but the attackers had large cannons that slowly broke them. After weeks of fighting, the city fell.
This event was important for history because it changed power in the region. The Ottoman Empire became much stronger, and trade routes were affected. Some historians say that Europeans then searched harder for new sea routes to Asia. Constantinople later became known as Istanbul. The fall of the city is often seen as the end of the Byzantine Empire and the start of a new era.`
        },
        {
            id: 'en-b1-3',
            title: 'Gutenberg and the Printing Press',
            level: 'B1',
            wordCount: 140,
            content: `Before printing, books were copied by hand. This took a long time, so books were expensive and rare. In the 1400s, Johannes Gutenberg in Germany developed a new way to make books faster. He used movable metal letters, ink, and a press. With this system, people could print many pages quickly and with the same text every time.
The printing press changed Europe. More books became available, and more people learned to read. Ideas could spread faster, including new scientific and religious thoughts. Newspapers and pamphlets later became important for politics as well. Gutenberg’s invention is remembered because it did not only change technology—it also changed education and communication. It helped create a world where information could travel much more easily than before.`
        },
        {
            id: 'en-b1-4',
            title: 'The First Successful Vaccine (1796)',
            level: 'B1',
            wordCount: 135,
            content: `In the 1700s, smallpox was one of the leading causes of death. People feared it because it spread easily and left many survivors with scars. An English doctor, Edward Jenner, noticed something interesting: milkmaids who had a mild disease called cowpox often did not get smallpox. In 1796, he tested his idea carefully. He used cowpox to protect a boy from smallpox. The experiment worked.
Later, the idea of vaccination spread to other countries. Over time, doctors improved vaccines and created new ones for many diseases. Smallpox eventually became the first disease to be eliminated worldwide. Jenner’s work is remembered because it introduced a new way to prevent illness instead of only treating it. It also changed public health and increased life expectancy in many parts of the world.`
        },
        {
            id: 'en-b1-5',
            title: 'The American Declaration of Independence',
            level: 'B1',
            wordCount: 140,
            content: `In the 1700s, thirteen British colonies in North America were unhappy with British rule. They had to pay taxes, but they felt they had no real political voice. Tensions grew, and fighting began. In 1776, colonial leaders wrote the Declaration of Independence. It said that people have basic rights and that the colonies should become independent.
The declaration did not end the war, but it gave the conflict a clear goal. After years of fighting, the colonies won and formed the United States. The document became famous because it influenced later movements for freedom and democracy around the world. At the same time, it also showed a contradiction: many people still lived in slavery, so the promise of “equal rights” was not true for everyone. This topic is still discussed today.`
        },
        {
            id: 'en-b1-6',
            title: 'The Wright Brothers’ Control of Flight',
            level: 'B1',
            wordCount: 135,
            content: `Early airplanes were not only about lifting off the ground. The biggest challenge was control. Many inventors could build machines that moved forward, but they could not turn safely or stay stable. The Wright brothers focused on this problem. They tested wings, studied wind, and built a system to control the aircraft in the air.
Their work helped aviation grow quickly. Once pilots could control a plane, longer flights became possible. Soon, airplanes were used for mail, travel, and later for war. The story is important because it shows that progress is often not one big moment, but many small improvements. The Wright brothers’ success came from careful experiments, strong teamwork, and learning from mistakes. Their approach is still a model for engineering today.`
        },
        {
            id: 'en-b1-7',
            title: 'Apollo 13: A Moon Mission That Became a Rescue',
            level: 'B1',
            wordCount: 140,
            content: `Apollo 13 was planned as a normal mission to the Moon. But two days after launch, an oxygen tank exploded. The astronauts lost power and oxygen, and they could not continue. Their main goal became survival. They used the lunar module as a “lifeboat,” but it had limited air and electricity.
On Earth, engineers worked day and night to find solutions. The team had to save energy, fix the carbon dioxide problem, and guide the spacecraft back safely. Every small decision mattered. After several tense days, the astronauts returned to Earth alive.
Apollo 13 is remembered because it shows how teamwork and calm thinking can solve a crisis. It also shows that even advanced technology can fail, and good planning must include emergency ideas. The mission became famous for human creativity under pressure.`
        },
        {
            id: 'en-b1-8',
            title: 'The Discovery of Penicillin (1928)',
            level: 'B1',
            wordCount: 135,
            content: `In 1928, scientist Alexander Fleming returned to his lab and noticed something unusual. A mold had grown on a dish of bacteria, and around the mold, the bacteria had died. Many people would have thrown the dish away, but Fleming studied it carefully. He realized the mold produced a substance that could kill bacteria. He later named it penicillin.
At first, penicillin was hard to produce in large amounts. But in the 1940s, scientists and factories worked together to make it widely available. It saved many lives, especially during World War II, because it treated infections that were often deadly before.
Penicillin is important because it started the age of antibiotics. It also teaches a lesson: discoveries can come from accidents, but only if someone is curious enough to investigate. Today, people also discuss antibiotic resistance, which shows the need to use such medicines responsibly.`
        },
        {
            id: 'en-b1-9',
            title: 'Gandhi’s Salt March (1930)',
            level: 'B1',
            wordCount: 140,
            content: `In British-ruled India, many people had to follow unfair laws. One law made warning signs clear: Indians could not make their own salt, and they had to buy taxed salt from the British. In 1930, Mohandas Gandhi chose salt as a symbol of unfair control. He led a long walk to the sea, known as the Salt March. Thousands of people joined him on the road, and many more supported the protest.
When Gandhi reached the coast, he made salt from seawater, breaking the law peacefully. The British arrested many protesters, but the march gained global attention. It showed that non-violent resistance could be powerful and organized. The Salt March did not bring independence immediately, but it strengthened the independence movement and united people across India. It is remembered as a key moment in the fight for self-rule.`
        },
        {
            id: 'en-b1-10',
            title: 'The First Transcontinental Railroad in the USA',
            level: 'B1',
            wordCount: 135,
            content: `In the 1800s, traveling across the United States could take months. People used wagons, horses, and dangerous routes. The idea of a railroad from the East to the West promised faster travel and stronger trade. Two companies built tracks from opposite directions, and thousands of workers did hard labor in difficult weather.
In 1869, the tracks finally met in Utah. A “golden spike” ceremony marked the completion. The railroad changed the country quickly. Goods moved faster, cities grew, and more people migrated west. But the project also had negative effects. It pushed Native American communities from their land and increased conflicts.
This story is important because it shows how technology can bring growth and connection, but also create serious social and ethical problems. History often includes both progress and cost.`
        },
        {
            id: 'en-b2-1',
            title: 'The Cuban Missile Crisis (1962)',
            level: 'B2',
            wordCount: 250,
            content: `In October 1962, the United States discovered that the Soviet Union was building nuclear missile sites in Cuba, only about 90 miles from Florida. The discovery came from U-2 spy plane photographs, and it immediately created a crisis because those missiles could reach major American cities in minutes. President John F. Kennedy faced a set of terrible options: do nothing and accept a new threat, launch air strikes and risk war, or attempt a blockade and hope the Soviets would back down.

Kennedy chose a naval “quarantine,” a carefully worded blockade designed to stop further weapons shipments without formally declaring war. For nearly two weeks, the world watched as Soviet ships approached the blockade line. Behind the scenes, diplomats and advisers argued about strategy, while military forces on both sides prepared for the possibility of nuclear conflict. The danger was not only political; it was also operational. A misunderstanding, a trigger-happy commander, or a technical error could have caused escalation faster than leaders could control.

Eventually, an agreement was reached: the Soviets would remove the missiles from Cuba, and the U.S. would publicly promise not to invade Cuba. Secretly, the U.S. also agreed to remove certain American missiles from Turkey. The crisis became a turning point because it showed how close the superpowers could come to catastrophe—and how essential communication and “off-ramps” are in moments of extreme tension.`
        },
        {
            id: 'en-b2-2',
            title: 'Galileo’s Trial and the Fight Over Evidence (1633)',
            level: 'B2',
            wordCount: 250,
            content: `In the early 1600s, Galileo Galilei used improved telescopes to observe the sky in ways few people had seen before. He found evidence that challenged the traditional Earth-centered view of the universe: Jupiter had moons, and Venus showed phases similar to the Moon. These observations supported the heliocentric model, which placed the Sun at the center. For Galileo, the point was not simply to be provocative; he believed nature could be studied through measurement and observation, and that conclusions should follow evidence.

However, Galileo lived in a world where scientific ideas were tied to religion, authority, and social order. The Catholic Church was cautious about interpretations that seemed to contradict Scripture or weaken its intellectual control. Galileo tried to navigate this tension by arguing that Scripture and science addressed different questions. But his writing style was often sharp, and his public debates created powerful enemies. In 1633, he was brought before the Roman Inquisition.

The trial was not just about astronomy; it was about who had the right to define truth. Galileo was forced to recant and spent the rest of his life under house arrest. Yet the long-term outcome favored his approach: modern science developed around methods that rely on testing, observation, and open debate. Galileo’s story is remembered because it shows that evidence alone is not always enough—ideas also need social protection and intellectual freedom to survive.`
        },
        {
            id: 'en-b2-3',
            title: 'The Building of the Panama Canal',
            level: 'B2',
            wordCount: 250,
            content: `For centuries, ships traveling between the Atlantic and Pacific Oceans had to take the long route around South America. A canal across Panama promised to transform global trade by saving time, fuel, and risk. The project was attempted first by the French in the late 1800s, but it collapsed due to financial problems, engineering difficulties, and deadly disease. When the United States took over in 1904, the challenge was still enormous: digging through mountains, controlling water, and keeping tens of thousands of workers alive in a tropical environment.

A key breakthrough was public health. Malaria and yellow fever killed many laborers, and earlier planners underestimated how dangerous the diseases were. Through mosquito control, sanitation, and medical organization, death rates dropped significantly. Engineering was the second challenge. Instead of building a sea-level canal, the U.S. constructed a lock-based system that raised ships to a man-made lake and then lowered them back down. This required massive concrete structures, careful water management, and continuous problem-solving.

When the canal opened in 1914, it immediately became one of the most strategic passages in the world. It reshaped shipping routes, strengthened U.S. influence in the region, and helped integrate global markets. But it also had costs: harsh working conditions, political intervention in Panama, and long-term debates about sovereignty. The canal is a classic example of how infrastructure can be both a technical triumph and a source of political controversy.`
        },
        {
            id: 'en-b2-4',
            title: 'The Meiji Restoration and Japan’s Transformation',
            level: 'B2',
            wordCount: 250,
            content: `In the mid-1800s, Japan faced a crisis of security and identity. For over 200 years, the country had limited foreign contact under the Tokugawa shogunate. But Western powers arrived with advanced weapons and demanded trade access. Many Japanese leaders feared that Japan would be forced into unequal treaties or even colonized. This pressure intensified internal conflict, and in 1868 the political order shifted dramatically: the Meiji Restoration began, returning formal authority to the emperor and opening the path to modernization.

The reforms that followed were fast and wide-ranging. The government built a centralized state, replaced many feudal privileges, and created a modern tax system. It introduced compulsory education, supported industrial development, and adopted Western military organization. Railways, factories, and new legal structures emerged in a single generation. The goal was not to copy the West blindly, but to become strong enough to negotiate with Western nations on equal terms.

This transformation had major social consequences. Traditional classes lost power, people moved from villages to cities, and new ideas about citizenship and national identity spread. Japan’s success in modernizing helped it resist colonization, but it also fed ambitions abroad. Within decades, Japan became a regional power and later pursued imperial expansion. The Meiji era is remembered because it shows how quickly a society can change when leaders treat modernization as a survival strategy—yet it also warns that modernization can be used for domination as well as defense.`
        },
        {
            id: 'en-b2-5',
            title: 'The Race to Decode the Rosetta Stone',
            level: 'B2',
            wordCount: 250,
            content: `In 1799, during Napoleon’s campaign in Egypt, French soldiers discovered a broken stone slab near the town of Rosetta. It looked ordinary at first, but scholars quickly realized it contained the same text written in three scripts: Greek, Demotic, and Egyptian hieroglyphs. Because Greek could be read, the stone offered a rare opportunity: it might unlock a language that had been silent for over a thousand years.

For years, European scholars competed to crack the code. The challenge was not simply translating words; it required understanding how hieroglyphs worked. Many believed they were purely symbolic, like pictures expressing ideas. But the key insight was that at least some symbols represented sounds—especially in names. By comparing repeated patterns and matching them with known Greek names, researchers slowly built a system.

Jean-François Champollion made the decisive breakthrough in 1822. He showed that hieroglyphs combined phonetic elements with symbolic and grammatical signs. This discovery opened the door to reading temple inscriptions, tombs, and papyrus documents. Suddenly, ancient Egypt was no longer visible only through archaeology and Greek historians—it could speak in its own voice.

The Rosetta Stone story is important because it illustrates how knowledge advances: through evidence, comparison, patience, and sometimes rivalry. It also shows how translation can reshape history. Once hieroglyphs could be read, Egyptology became a serious discipline, and our understanding of ancient religion, politics, and daily life expanded dramatically.`
        },
        {
            id: 'en-b2-6',
            title: 'The 2008 Financial Crisis and Global Shockwaves',
            level: 'B2',
            wordCount: 250,
            content: `In 2008, a crisis that began inside the U.S. housing market turned into a global financial emergency. For years, banks and investors had treated housing as a safe asset. Mortgages were bundled into complex financial products and sold worldwide, often with ratings that suggested low risk. Meanwhile, lending standards weakened, and many borrowers received loans they could not afford if prices stopped rising.

When housing prices began to fall, defaults increased. Financial institutions that held mortgage-backed assets suddenly faced huge losses, and because the system was highly interconnected, fear spread quickly. Banks stopped trusting one another, credit froze, and major firms collapsed or required rescue. The bankruptcy of Lehman Brothers became a symbol of how severe the situation had become.

Governments responded with emergency measures: bank bailouts, stimulus packages, and aggressive central bank actions to stabilize markets. Even so, the economic damage was deep. Unemployment rose, businesses failed, and many families lost homes and savings. The crisis also triggered political consequences: public anger about inequality, distrust of institutions, and debates over regulation intensified across many countries.

What made 2008 historically significant was the way financial risk moved across borders. A problem rooted in American mortgages quickly affected European banks, global trade, and national budgets. The crisis remains a case study in how incentives, weak oversight, and complex financial engineering can create instability—and how the costs often fall hardest on people who had little role in causing the problem.`
        },
        {
            id: 'en-b2-7',
            title: 'The Great Irish Famine and Mass Migration',
            level: 'B2',
            wordCount: 250,
            content: `In the mid-1800s, Ireland experienced a catastrophe that reshaped the nation’s demography and political memory. The immediate cause was a potato blight, a plant disease that destroyed the main food source for millions of poor rural families. Because many Irish tenants relied heavily on potatoes for survival, the blight was not just an agricultural problem—it was a direct threat to life.

Yet the famine was not purely “natural.” Ireland was part of the United Kingdom, and its economic system was highly unequal. Many tenants paid rent to landlords and had little security. While people starved, other food products were still exported. The government’s response included relief programs, but it was inconsistent and often influenced by ideology: some policymakers believed the market should correct itself, or that aid would create dependency. Meanwhile, disease spread through weakened communities, and workhouses became overcrowded.

The human impact was staggering. Around one million people died, and another million emigrated, especially to the United States and Canada. Many emigrants endured dangerous journeys in overcrowded ships. Those who survived formed large Irish communities abroad, shaping the culture and politics of cities like Boston and New York.

The famine changed Ireland permanently: population declined, rural life transformed, and resentment toward British rule grew. It became a major factor in later nationalist movements. The event is remembered not only for starvation, but for what it reveals about power: when a society lacks protection for its most vulnerable, a crop failure can become a national trauma.`
        },
        {
            id: 'en-b2-8',
            title: 'The Fall of Saigon and the End of the Vietnam War',
            level: 'B2',
            wordCount: 250,
            content: `By the early 1970s, the Vietnam War had already cost millions of lives and deeply divided public opinion worldwide. After years of heavy U.S. involvement, American troops gradually withdrew, and the South Vietnamese government faced increasing pressure from the North. Despite continued aid, South Vietnam struggled with political instability, corruption, and weakening military capacity.

In 1975, North Vietnamese forces launched a major offensive that advanced rapidly. Cities fell one after another, and panic grew in Saigon, the capital of South Vietnam. Many civilians feared punishment for working with the government or Americans. The final days were marked by chaos: desperate attempts to escape, crowded streets, and frantic communication. Images of helicopters evacuating people from rooftops became global symbols of the war’s end.

When Saigon fell on April 30, 1975, Vietnam was soon reunified under communist rule. But the end of the war did not bring immediate peace for everyone. Many families were separated, and large numbers fled the country in the following years, including the “boat people,” who faced dangerous conditions at sea. Inside Vietnam, rebuilding was difficult, and political re-education campaigns affected many former officials and soldiers.

Historically, the fall of Saigon represents both a military conclusion and a human turning point. It highlights how wars end not only with treaties and flags, but with personal decisions under fear—whether to stay, flee, or start over. It also influenced how later generations judged intervention, propaganda, and the limits of military power.`
        },
        {
            id: 'en-b2-9',
            title: 'The Chernobyl Disaster and Trust in Institutions',
            level: 'B2',
            wordCount: 250,
            content: `On April 26, 1986, a catastrophic accident occurred at the Chernobyl nuclear power plant in Soviet Ukraine. During a late-night safety test, a combination of design flaws and operator decisions led to an uncontrolled reaction in Reactor 4. The result was an explosion and a fire that released radioactive material into the atmosphere. Firefighters and plant workers responded immediately, often without fully understanding the level of exposure they faced.

What made Chernobyl particularly damaging was not only the technical failure but the information failure. At first, Soviet authorities minimized the incident and delayed public warnings. Evacuation of the nearby city of Pripyat happened only after significant exposure had likely occurred. International awareness increased when radiation was detected in other countries, forcing greater transparency. In the weeks that followed, thousands of “liquidators” worked to contain the disaster, build a concrete shelter, and decontaminate areas—often at great personal risk.

Chernobyl had long-term consequences: large exclusion zones, health debates, psychological trauma, and a lasting impact on energy policy across Europe. It also shaped political trust. Many citizens concluded that secrecy and reputation mattered more to officials than public safety. Some historians argue that the disaster contributed to the weakening of Soviet legitimacy during a period of reform.

Chernobyl remains a powerful case study in modern risk: when technology is complex, safety depends not only on machines but on culture—training, accountability, transparency, and the willingness to report problems early rather than hide them.`
        },
        {
            id: 'en-b2-10',
            title: 'The Watergate Scandal and Democratic Accountability',
            level: 'B2',
            wordCount: 250,
            content: `In 1972, a group of men was caught breaking into the Democratic Party’s headquarters at the Watergate complex in Washington, D.C. At first, the incident seemed like a strange but limited case of political spying. Over time, investigations revealed deeper links to President Richard Nixon’s re-election campaign and, more importantly, a sustained effort to cover up the truth. The scandal grew into a constitutional crisis that tested the strength of American democratic institutions.

A major driver of the story was investigative journalism. Reporters followed money trails, confirmed sources, and kept the issue in public view. Congressional hearings then exposed patterns of abuse, including attempts to obstruct justice and pressure agencies. The turning point involved secret tape recordings from the White House. These tapes became crucial evidence because they captured internal conversations and decision-making. When courts demanded their release, the conflict shifted from politics to the rule of law: could the president refuse oversight?

As evidence accumulated, Nixon’s support collapsed. In 1974, he resigned—the first U.S. president to do so. Watergate had long-term effects: stricter campaign rules, greater scrutiny of executive power, and a lasting public skepticism toward government. Supporters of the process argued it proved democracy could correct itself. Critics argued the damage to trust was permanent.

Watergate is remembered because it illustrates a key principle: elections alone do not protect democracy. Accountability depends on independent courts, a free press, and officials willing to enforce limits on power. When those checks work, even the most powerful leaders can be held responsible—though often only after significant social and political turmoil.`
        },
    ],

    // GERMAN 🇩🇪
    de: [
        {
            id: 'de-a1-1',
            title: 'Die Pyramiden in Ägypten',
            level: 'A1',
            wordCount: 45,
            content: `Vor sehr langer Zeit sind viele Menschen in Ägypten. Sie bauen große Pyramiden. Die Pyramiden sind aus Stein. Die Arbeit ist schwer. Viele Menschen helfen. Heute besuchen Touristen die Pyramiden. Sie machen Fotos. Die Pyramiden sind sehr alt und berühmt.`
        },
        {
            id: 'de-a1-2',
            title: 'Julius Caesar in Rom',
            level: 'A1',
            wordCount: 50,
            content: `Julius Caesar lebt in Rom. Er ist ein wichtiger Mann. Viele Menschen kennen seinen Namen. Er hat Soldaten und Macht. Rom ist eine große Stadt. Viele Leute reden über Caesar. Eines Tages ist es sehr gefährlich für ihn. Sein Name bleibt in der Geschichte.`
        },
        {
            id: 'de-a1-3',
            title: 'Die Wikinger fahren über das Meer',
            level: 'A1',
            wordCount: 48,
            content: `Die Wikinger leben im Norden. Es ist dort kalt. Sie haben Schiffe aus Holz. Sie fahren über das Meer. Sie suchen neue Orte. Manchmal handeln sie. Manchmal kämpfen sie. Heute sind Wikinger sehr bekannt.`
        },
        {
            id: 'de-a1-4',
            title: 'Marco Polo reist nach China',
            level: 'A1',
            wordCount: 48,
            content: `Marco Polo kommt aus Italien. Er reist sehr weit. Er fährt viele Monate. Er geht durch Berge und Wüsten. Er kommt nach China. China ist für ihn neu und spannend. Er sieht viele Dinge. Später erzählt er seine Reise.`
        },
        {
            id: 'de-a1-5',
            title: 'Gutenberg und das erste Buch',
            level: 'A1',
            wordCount: 48,
            content: `Johannes Gutenberg lebt in Deutschland. Er hat eine neue Idee. Er baut eine Druckmaschine. Mit der Maschine kann man viele Seiten drucken. Das ist neu. Bücher sind jetzt leichter zu machen. Viele Menschen können lesen lernen. Heute ist Gutenberg sehr berühmt.`
        },
        {
            id: 'de-a1-6',
            title: 'Kolumbus fährt über den Ozean',
            level: 'A1',
            wordCount: 50,
            content: `Christoph Kolumbus ist Seefahrer. Er lebt in Europa. Er will einen neuen Weg nach Indien finden. Er fährt mit Schiffen über den Ozean. Die Reise dauert lange. Viele Menschen haben Angst. Dann sieht Kolumbus Land. Das ist ein sehr bekanntes Ereignis.`
        },
        {
            id: 'de-a1-7',
            title: 'Die erste Mondlandung',
            level: 'A1',
            wordCount: 46,
            content: `Im Jahr 1969 schauen viele Menschen Fernsehen. Ein Mann fliegt zum Mond. Er heißt Neil Armstrong. Er steigt aus dem Raumschiff. Er geht auf dem Mond. Das ist ein großer Moment. Viele Menschen sind überrascht. Heute erinnern sich viele daran.`
        },
        {
            id: 'de-a1-8',
            title: 'Das Berliner Mauer fällt',
            level: 'A1',
            wordCount: 45,
            content: `In Berlin gibt es lange eine Mauer. Die Mauer trennt die Stadt. Viele Familien sind getrennt. Dann kommt ein wichtiger Tag: 1989. Viele Menschen gehen zur Mauer. Sie sind glücklich. Die Mauer fällt. Berlin wird wieder eine Stadt.`
        },
        {
            id: 'de-a1-9',
            title: 'Die Olympischen Spiele',
            level: 'A1',
            wordCount: 47,
            content: `Die Olympischen Spiele sind ein großes Sportfest. Viele Länder kommen zusammen. Es gibt Laufen, Schwimmen und viele andere Sportarten. Die Sportler trainieren lange. Sie wollen gewinnen. Viele Menschen schauen zu. Sie klatschen und freuen sich. Olympia ist sehr bekannt in der Welt.`
        },
        {
            id: 'de-a1-10',
            title: 'Ein großer Brand in London',
            level: 'A1',
            wordCount: 48,
            content: `Vor langer Zeit gibt es einen großen Brand in London. Viele Häuser sind aus Holz. Das Feuer ist stark. Es geht schnell von Haus zu Haus. Die Menschen laufen weg. Viele Gebäude brennen. Später baut die Stadt neue Häuser. Der Brand ist ein bekanntes Ereignis.`
        },
        {
            id: 'de-a2-1',
            title: 'Kleopatra und das alte Ägypten',
            level: 'A2',
            wordCount: 58,
            content: `Kleopatra war Königin von Ägypten. Sie lebte in Alexandria und sprach mehrere Sprachen. Viele Menschen respektierten sie, aber es gab auch viele Feinde. Rom war damals sehr stark, und Ägypten musste klug handeln. Kleopatra traf wichtige Politiker aus Rom, um ihr Land zu schützen. Am Ende verlor Ägypten seine Unabhängigkeit. Trotzdem erinnern sich viele Menschen bis heute an ihren Namen.`
        },
        {
            id: 'de-a2-2',
            title: 'Pompeji und der Vulkan Vesuv',
            level: 'A2',
            wordCount: 65,
            content: `Pompeji war eine schöne Stadt in Italien. Im Jahr 79 brach der Vulkan Vesuv aus. Zuerst fiel Asche vom Himmel, dann kamen heiße Steine. Viele Menschen hatten Angst und wollten fliehen. Aber es ging sehr schnell, und viele schafften es nicht. Die Stadt wurde unter Asche begraben und verschwand lange Zeit. Später haben Archäologen Pompeji wieder gefunden. Heute kann man dort alte Häuser und Straßen sehen.`
        },
        {
            id: 'de-a2-3',
            title: 'Die Ritter und Burgen im Mittelalter',
            level: 'A2',
            wordCount: 62,
            content: `Im Mittelalter gab es viele Burgen in Europa. Ritter lebten oft auf einer Burg und dienten einem König oder einem Grafen. Sie trugen Rüstung und ritten auf Pferden. Manche Ritter kämpften, andere schützten Dörfer. Das Leben war nicht immer romantisch, denn es gab Kriege und wenig Komfort. In vielen Burgen war es kalt und dunkel. Trotzdem sind Burgen heute sehr beliebt bei Touristen.`
        },
        {
            id: 'de-a2-4',
            title: 'Jeanne d’Arc hilft Frankreich',
            level: 'A2',
            wordCount: 64,
            content: `Jeanne d’Arc war ein junges Mädchen aus Frankreich. Sie sagte, sie hört Stimmen und hat eine Mission. Frankreich hatte damals einen langen Krieg gegen England. Jeanne ging zu Soldaten und machte ihnen Mut. Viele Menschen folgten ihr, weil sie sehr überzeugt war. Sie half bei wichtigen Kämpfen, und Frankreich bekam neue Hoffnung. Später wurde sie gefangen genommen und verurteilt. Heute gilt sie in Frankreich als eine wichtige Figur der Geschichte.`
        },
        {
            id: 'de-a2-5',
            title: 'Leonardo da Vinci und seine Ideen',
            level: 'A2',
            wordCount: 60,
            content: `Leonardo da Vinci lebte in Italien in der Zeit der Renaissance. Er malte berühmte Bilder und zeichnete viele Skizzen. Er interessierte sich für den menschlichen Körper, Maschinen und Natur. Oft arbeitete er lange an einer Idee und schrieb alles in Notizbücher. Manche seiner Pläne waren ihrer Zeit weit voraus. Viele Menschen bewundern seine Kreativität bis heute. Seine Werke kann man in Museen auf der ganzen Welt sehen.`
        },
        {
            id: 'de-a2-6',
            title: 'Die erste Fahrt mit der Eisenbahn',
            level: 'A2',
            wordCount: 65,
            content: `Im 19. Jahrhundert wurde die Eisenbahn immer wichtiger. Früher reisten Menschen langsam mit Pferd oder Kutsche. Mit der Eisenbahn konnte man plötzlich viel schneller fahren. Das war für Handel und Arbeit ein großer Vorteil. Viele Städte bekamen Bahnhöfe, und neue Strecken entstanden. Menschen konnten leichter in andere Regionen ziehen. Die Welt wurde dadurch kleiner und vernetzter. Heute sind Züge in vielen Ländern ein normaler Teil des Lebens.`
        },
        {
            id: 'de-a2-7',
            title: 'Der Untergang der Titanic',
            level: 'A2',
            wordCount: 68,
            content: `Die Titanic war ein sehr großes Schiff. Im Jahr 1912 fuhr sie von Europa nach Amerika. Viele Menschen glaubten, das Schiff sei sehr sicher. In einer kalten Nacht traf die Titanic einen Eisberg. Wasser kam ins Schiff, und es sank. Es gab zu wenige Rettungsboote für alle. Viele Menschen starben, und die Welt war schockiert. Die Titanic ist bis heute eine der bekanntesten Schiffskatastrophen.`
        },
        {
            id: 'de-a2-8',
            title: 'Martin Luther King und ein großer Traum',
            level: 'A2',
            wordCount: 70,
            content: `Martin Luther King lebte in den USA. Er kämpfte für gleiche Rechte für alle Menschen, besonders für schwarze Menschen. Er wollte keine Gewalt, sondern friedliche Proteste. Viele Menschen gingen mit ihm auf die Straße und hörten seine Reden. Eine Rede wurde sehr berühmt: „I have a dream“. Er sprach von einer Zukunft ohne Rassismus. Später wurde er ermordet, aber seine Ideen hatten großen Einfluss. Heute erinnern viele Länder an seinen Einsatz für Freiheit.`
        },
        {
            id: 'de-a2-9',
            title: 'Die Erfindung des Telefons',
            level: 'A2',
            wordCount: 66,
            content: `Früher konnten Menschen nur Briefe schreiben oder persönlich sprechen. Dann wurde das Telefon erfunden, und das änderte den Alltag. Alexander Graham Bell wird oft als wichtiger Erfinder genannt. Mit dem Telefon konnte man plötzlich sofort miteinander reden, auch über große Distanz. Firmen und Familien nutzten es schnell. Später kamen Handys und das Internet dazu. Kommunikation wurde immer einfacher und schneller. Heute ist es schwer, sich ein Leben ohne Telefon vorzustellen.`
        },
        {
            id: 'de-a2-10',
            title: 'Die erste Frau im Weltall',
            level: 'A2',
            wordCount: 63,
            content: `Valentina Tereschkowa war eine Frau aus der Sowjetunion. Im Jahr 1963 flog sie als erste Frau ins Weltall. Das war damals etwas ganz Neues und sehr mutig. Viele Menschen verfolgten die Mission in den Nachrichten. Für viele Frauen war sie ein wichtiges Vorbild. Sie zeigte, dass Frauen auch in der Raumfahrt erfolgreich sein können. Diese Reise wurde ein Teil der Geschichte der Wissenschaft. Bis heute spricht man über diesen besonderen Schritt.`
        },
        {
            id: 'de-b1-1',
            title: 'Die Entdeckung von Penicillin',
            level: 'B1',
            wordCount: 75,
            content: `1928 arbeitete Alexander Fleming in seinem Labor in London. Nach einem Urlaub bemerkte er etwas Ungewöhnliches: Auf einer seiner Petrischalen wuchs Schimmel, und um den Schimmel herum starben Bakterien ab. Zuerst dachte er, es sei nur ein Zufall, doch dann verstand er, dass dieser Schimmel eine starke Wirkung hatte. Später nannte man den Stoff „Penicillin“. Viele Jahre danach wurde Penicillin in großen Mengen produziert und rettete unzählige Leben, besonders während des Zweiten Weltkriegs. Diese Entdeckung veränderte die Medizin für immer.`
        },
        {
            id: 'de-b1-2',
            title: 'Die ersten Olympischen Spiele',
            level: 'B1',
            wordCount: 95,
            content: `Im Jahr 1896 fanden in Athen die ersten Olympischen Spiele der Neuzeit statt. Der französische Pädagoge Pierre de Coubertin hatte die Idee, Sportler aus vielen Ländern friedlich zusammenzubringen. Für Griechenland war es ein besonderes Ereignis, weil die Olympischen Spiele ursprünglich aus der Antike stammten. Die Athleten traten in verschiedenen Disziplinen an, und viele Zuschauer waren begeistert. Obwohl die Organisation damals einfacher war als heute, war die Wirkung groß: Von diesem Moment an entwickelten sich die Spiele zu einem weltweiten Symbol für Sport und internationale Begegnung.`
        },
        {
            id: 'de-b1-3',
            title: 'Die Reise von Charles Darwin',
            level: 'B1',
            wordCount: 85,
            content: `Als Charles Darwin 1831 auf das Schiff „Beagle“ stieg, war er noch ein junger Forscher. Die Reise dauerte fast fünf Jahre und führte ihn um die Welt. Besonders auf den Galápagos-Inseln machte er Beobachtungen, die ihn später stark beeinflussten. Er sah, dass Tiere auf verschiedenen Inseln ähnlich waren, aber kleine Unterschiede hatten. Darwin fragte sich, warum das so war. Viele Jahre später veröffentlichte er seine Theorie der Evolution, die heftig diskutiert wurde. Seine Ideen prägen bis heute die Wissenschaft.`
        },
        {
            id: 'de-b1-4',
            title: 'Der Fall der Berliner Mauer',
            level: 'B1',
            wordCount: 88,
            content: `Fast 28 Jahre lang trennte die Berliner Mauer Ost- und Westberlin. Familien, Freunde und ganze Lebenswege wurden dadurch geteilt. Im Herbst 1989 wuchs in der DDR der Protest, weil immer mehr Menschen Freiheit und Reformen wollten. Als am 9. November 1989 eine neue Regelung bekannt gegeben wurde, verstanden viele, dass die Grenze geöffnet werden könnte. Noch am selben Abend gingen Tausende zur Mauer. Menschen kletterten hinauf, umarmten sich und feierten. Der Mauerfall wurde zu einem Symbol für das Ende der Teilung in Europa.`
        },
        {
            id: 'de-b1-5',
            title: 'Die Titanic und die Folgen',
            level: 'B1',
            wordCount: 85,
            content: `Die Titanic galt 1912 als technisches Meisterwerk und als besonders sicher. Viele Passagiere reisten voller Hoffnung nach Amerika, manche suchten ein besseres Leben. In der Nacht vom 14. auf den 15. April kollidierte das Schiff jedoch mit einem Eisberg. Weil es zu wenige Rettungsboote gab und die Situation chaotisch war, starben sehr viele Menschen. Später untersuchten Experten die Katastrophe und änderten Sicherheitsregeln auf See. Obwohl die Titanic unterging, führte das Unglück dazu, dass Schiffe weltweit besser vorbereitet sein mussten.`
        },
        {
            id: 'de-b1-6',
            title: 'Martin Luther King',
            level: 'B1',
            wordCount: 95,
            content: `In den 1950er- und 1960er-Jahren kämpften viele Menschen in den USA gegen Rassentrennung und Diskriminierung. Martin Luther King Jr. wurde zu einer der wichtigsten Stimmen dieser Bewegung. Er setzte auf gewaltfreien Protest, weil er glaubte, dass Hass keinen Hass besiegen kann. Bei Demonstrationen, Märschen und Boykotten sprach er mutig über Gleichberechtigung. Seine Rede „I have a dream“ machte weltweit Eindruck, weil sie Hoffnung und eine klare Vision vermittelte. 1968 wurde er ermordet, doch seine Botschaft beeinflusst bis heute Menschen, die für Rechte und Würde kämpfen.`
        },
        {
            id: 'de-b1-7',
            title: 'Die erste Mondlandung',
            level: 'B1',
            wordCount: 90,
            content: `Als die NASA 1969 die Mission Apollo 11 startete, verfolgte die ganze Welt das Ereignis. Die Reise war riskant, denn Technik und Wissenschaft standen unter großem Druck. Nach mehreren Tagen erreichten die Astronauten den Mond. Neil Armstrong stieg als erster Mensch aus der Landefähre und setzte seinen Fuß auf die Oberfläche. Millionen Menschen sahen es live im Fernsehen, obwohl die Bildqualität damals schlecht war. Die Mondlandung zeigte, wozu Menschen fähig sind, wenn sie gemeinsam forschen und große Ziele verfolgen. Gleichzeitig begann eine neue Phase der Raumfahrt.`
        },
        {
            id: 'de-b1-8',
            title: 'Die Erfindung des Buchdrucks',
            level: 'B1',
            wordCount: 88,
            content: `Im 15. Jahrhundert waren Bücher teuer, weil sie meist von Hand kopiert wurden. Johannes Gutenberg entwickelte in Mainz ein System, mit dem man Texte schneller und in größerer Zahl drucken konnte. Entscheidend waren bewegliche Metallbuchstaben, die man immer wieder benutzen konnte. Dadurch wurden Bücher günstiger und für mehr Menschen zugänglich. Wissen verbreitete sich schneller, und neue Ideen konnten sich leichter durchsetzen. Viele Historiker sagen, dass der Buchdruck die Gesellschaft stark verändert hat, weil Bildung und Diskussionen plötzlich ganz neue Möglichkeiten bekamen.`
        },
        {
            id: 'de-b1-9',
            title: 'Die Französische Revolution',
            level: 'B1',
            wordCount: 85,
            content: `Ende des 18. Jahrhunderts war Frankreich in einer schweren Krise. Viele Menschen litten unter Armut, während der Adel oft Privilegien hatte. 1789 wuchs der Unmut so stark, dass es zu Aufständen kam. Ein bekanntes Symbol ist der Sturm auf die Bastille, ein Gefängnis in Paris. Die Revolution brachte große Veränderungen: Man sprach von Freiheit, Gleichheit und Bürgerrechten. Gleichzeitig war die Zeit sehr brutal, weil viele Gegner hingerichtet wurden. Trotzdem beeinflussten die Ideen der Revolution später viele Länder und politische Bewegungen.`
        },
        {
            id: 'de-b1-10',
            title: 'Die Spanische Grippe',
            level: 'B1',
            wordCount: 92,
            content: `Zwischen 1918 und 1920 verbreitete sich weltweit eine schwere Grippe, die man später „Spanische Grippe“ nannte. Viele Menschen waren nach dem Ersten Weltkrieg geschwächt, und es gab wenig medizinische Möglichkeiten. Die Krankheit traf Städte und Dörfer, junge und alte Menschen, und sie forderte Millionen Tote. In vielen Orten wurden Schulen geschlossen und große Treffen verboten, um Ansteckungen zu reduzieren. Die Pandemie zeigte, wie schnell sich Krankheiten global ausbreiten können. Auch heute erinnern Experten daran, weil sie wichtige Lehren für den Umgang mit Gesundheitskrisen liefert.`
        },
        {
            id: 'de-b2-1',
            title: 'Martin Luther und der Beginn der Reformation (1517)',
            level: 'B2',
            wordCount: 185,
            content: `Im frühen 16. Jahrhundert war die katholische Kirche in Europa nicht nur eine religiöse, sondern auch eine politische Macht. Viele Menschen glaubten, dass ihr Seelenheil stark von kirchlichen Regeln abhänge. Gleichzeitig wuchs der Unmut über Missstände: Besonders umstritten war der Ablasshandel, bei dem Gläubige gegen Geld versprochen bekamen, ihre Sündenlast zu verringern. Für viele wirkte das wie ein Geschäft mit der Angst.

Martin Luther, ein Mönch und Theologieprofessor in Wittenberg, kritisierte diese Praxis offen. Im Jahr 1517 veröffentlichte er seine „95 Thesen“, in denen er Fragen stellte, die damals gefährlich waren: Kann man Vergebung wirklich kaufen? Wer entscheidet über Schuld und Gnade? Ob Luther die Thesen tatsächlich an die Kirchentür schlug oder sie vor allem verbreiten ließ, ist weniger wichtig als das Ergebnis: Seine Kritik traf den Nerv der Zeit.

Entscheidend war, dass sich Luthers Ideen durch den Buchdruck schnell verbreiteten. Plötzlich konnten Texte in großer Zahl kopiert werden, und Diskussionen verließen die Universitäten und Klöster. Menschen, die zuvor kaum Zugang zu Debatten hatten, wurden Teil eines Konflikts, der Europa veränderte. Die Kirche reagierte hart, Luther wurde verurteilt und sollte seine Aussagen widerrufen. Doch er blieb standhaft.

Die Reformation spaltete die Christenheit in verschiedene Konfessionen und führte in vielen Regionen zu politischen Krisen und Kriegen. Gleichzeitig löste sie langfristig Prozesse aus, die Bildung, Sprache und staatliche Ordnung prägten. Luthers Bibelübersetzung stärkte zudem die Entwicklung einer einheitlicheren deutschen Schriftsprache. So wurde aus einer theologischen Auseinandersetzung ein Ereignis mit tiefen gesellschaftlichen Folgen.`
        },
        {
            id: 'de-b2-2',
            title: 'Der Untergang von Konstantinopel (1453)',
            level: 'B2',
            wordCount: 195,
            content: `Konstantinopel galt jahrhundertelang als eine der bedeutendsten Städte der Welt. Sie war das Zentrum des Byzantinischen Reiches, ein kultureller Knotenpunkt und eine strategische Festung zwischen Europa und Asien. Doch im 15. Jahrhundert war das Reich bereits stark geschwächt. Viele Gebiete waren verloren gegangen, und die Stadt selbst war zwar symbolisch mächtig, aber militärisch verletzlich.

1453 belagerte der osmanische Sultan Mehmed II. Konstantinopel mit einem großen Heer. Besonders neu und entscheidend war der Einsatz schwerer Kanonen, die die berühmten Stadtmauern über längere Zeit beschädigen konnten. Wochenlang hielten die Verteidiger stand, doch die Ressourcen waren begrenzt, und Hilfe aus dem Westen kam kaum. Als die Stadt schließlich fiel, endete damit nicht nur eine Belagerung, sondern faktisch ein ganzes Reich.

Historisch wird dieses Ereignis oft als Wendepunkt betrachtet. Zum einen veränderte es das Machtgleichgewicht in der Region: Das Osmanische Reich gewann enorme Bedeutung und kontrollierte wichtige Handelswege. Zum anderen hatte der Fall der Stadt kulturelle Auswirkungen: Viele Gelehrte und Manuskripte gelangten nach Westen, was in der europäischen Renaissance eine Rolle spielte. Außerdem trug die neue Lage dazu bei, dass europäische Staaten verstärkt nach alternativen Handelsrouten suchten.

In diesem Zusammenhang wird häufig argumentiert, dass der Druck auf den Handel die Suche nach Seewegen nach Asien beschleunigte — und damit indirekt auch die Ära großer Entdeckungsreisen. Auch wenn Geschichte nie nur eine einzige Ursache hat, zeigt Konstantinopel 1453, wie ein militärisches Ereignis weitreichende wirtschaftliche und kulturelle Kettenreaktionen auslösen kann.`
        },
        {
            id: 'de-b2-3',
            title: 'Die Berliner Luftbrücke (1948–1949)',
            level: 'B2',
            wordCount: 190,
            content: `Nach dem Zweiten Weltkrieg war Deutschland in Besatzungszonen geteilt, und Berlin lag als besondere Zone mitten im sowjetischen Einflussgebiet. Was zunächst als Übergangslösung gedacht war, entwickelte sich schnell zu einem zentralen Konfliktpunkt des beginnenden Kalten Krieges. Als die westlichen Alliierten 1948 eine Währungsreform einführten, reagierte die Sowjetunion mit einer drastischen Maßnahme: Sie blockierte die Land- und Wasserwege nach Westberlin.

Für die Menschen in Westberlin wurde die Lage lebensbedrohlich. Lebensmittel, Kohle und medizinische Versorgung konnten kaum noch geliefert werden. Anstatt die Stadt aufzugeben oder militärisch zu eskalieren, entschieden sich die Westalliierten für eine ungewöhnliche Strategie: Sie versorgten die Stadt per Flugzeug. Die Berliner Luftbrücke war eine gigantische logistische Operation, bei der Tag und Nacht Maschinen landeten, entluden und wieder starteten. Nicht nur die Menge der Güter war enorm, sondern auch die Notwendigkeit, den Luftverkehr minutiös zu koordinieren.

Die Luftbrücke war mehr als Versorgung — sie war ein politisches Signal. Sie zeigte, dass Westberlin nicht fallen gelassen werden sollte, selbst wenn der Preis hoch war. Gleichzeitig wurde sie zu einem Symbol für Durchhaltewillen und für die Idee, dass eine Stadt nicht nur mit Waffen, sondern auch mit Organisation und Solidarität verteidigt werden kann. Als die Blockade 1949 endete, war klar, dass die Teilung Europas sich vertiefen würde.

Langfristig verstärkte die Luftbrücke die Bindung Westberlins an den Westen und prägte das Selbstverständnis der Stadt über Jahrzehnte. Sie macht deutlich, wie sehr technische Fähigkeiten, politische Entscheidungen und menschliche Ausdauer in der Geschichte zusammenhängen.`
        },
        {
            id: 'de-b2-4',
            title: 'Die Kubakrise (1962)',
            level: 'B2',
            wordCount: 200,
            content: `Im Oktober 1962 entdeckten die USA mithilfe von Aufklärungsflugzeugen sowjetische Raketenstellungen auf Kuba. Diese Information war explosiv: Kuba liegt nur wenige hundert Kilometer von der US-Küste entfernt, wodurch Raketen das strategische Gleichgewicht plötzlich massiv veränderten. In einer Zeit, in der beide Supermächte bereits über Atomwaffen verfügten, konnte ein Fehler katastrophale Folgen haben.

US-Präsident John F. Kennedy stand vor mehreren Optionen, die alle riskant waren: ein direkter Angriff, eine Invasion oder eine Blockade. Er entschied sich für eine „Quarantäne“, also eine Seeblockade, um weitere Lieferungen zu stoppen, ohne sofort militärisch zuzuschlagen. Gleichzeitig liefen hinter den Kulissen hektische Verhandlungen. Das Problem war nicht nur die militärische Lage, sondern auch die öffentliche Wirkung: Beide Seiten wollten Stärke zeigen und durften dennoch nicht die Kontrolle verlieren.

Die Krise zeigte, wie schnell Eskalation entstehen kann, wenn Misstrauen, Zeitdruck und militärische Logik zusammenkommen. Ein Missverständnis auf See, ein unklarer Befehl oder ein übermotivierter Kommandant hätte reichen können, um eine Kettenreaktion auszulösen. Schließlich kam es zu einem Deal: Die Sowjetunion zog die Raketen von Kuba ab, und die USA machten im Gegenzug Zusagen, Kuba nicht anzugreifen. Zusätzlich zogen die USA später auch eigene Raketen aus der Türkei ab, was jedoch weniger öffentlich kommuniziert wurde.

Die Kubakrise gilt bis heute als Lehrstück für Krisenmanagement. Sie führte dazu, dass direkte Kommunikationswege zwischen Washington und Moskau eingerichtet wurden, um in Zukunft schneller deeskalieren zu können. Vor allem zeigt sie, dass politische Führung manchmal bedeutet, nicht maximal zu drohen, sondern einen Ausweg zu schaffen, der für beide Seiten akzeptabel ist.`
        },
        {
            id: 'de-b2-5',
            title: 'Tschernobyl (1986)',
            level: 'B2',
            wordCount: 185,
            content: `Am 26. April 1986 kam es im Kernkraftwerk Tschernobyl in der damaligen Sowjetunion zu einem Reaktorunfall, der als eine der schwersten Nuklearkatastrophen der Geschichte gilt. Ausgelöst wurde er durch einen Test, der unter ungünstigen Bedingungen durchgeführt wurde. Eine Kombination aus technischen Schwächen, menschlichen Fehlentscheidungen und organisatorischem Druck führte dazu, dass der Reaktor außer Kontrolle geriet. Es kam zu Explosionen, und radioaktives Material gelangte in die Atmosphäre.

Was Tschernobyl so prägend machte, war nicht nur die unmittelbare Zerstörung, sondern auch die Informationspolitik. Anfangs wurden Risiken heruntergespielt, Evakuierungen verzögert und die Öffentlichkeit unzureichend informiert. Erst als Messungen in anderen Ländern erhöhte Strahlung zeigten, wurde das Ausmaß international sichtbar. Für viele Menschen erschütterte das das Vertrauen in staatliche Transparenz und in die Sicherheit der Technologie.

Die Folgen waren vielfältig: ganze Regionen wurden gesperrt, die Stadt Prypjat wurde verlassen, und zahlreiche Helfer mussten unter gefährlichen Bedingungen arbeiten, um den Brand zu bekämpfen und den Reaktor zu sichern. Langfristig beeinflusste Tschernobyl die Energiepolitik vieler Länder. In der öffentlichen Debatte wurden Fragen zentral, die bis heute aktuell sind: Wie sicher ist eine Technologie wirklich, wenn Menschen unter Druck entscheiden? Welche Rolle spielen offene Kommunikation und unabhängige Kontrolle? Und wie geht eine Gesellschaft mit Risiken um, die man nicht sehen, riechen oder sofort verstehen kann?

Tschernobyl ist daher nicht nur eine technische Katastrophe, sondern auch eine Geschichte über Systeme: über Verantwortung, über Fehlerkultur und über die Konsequenzen, wenn Institutionen Transparenz durch Kontrolle ersetzen.`
        }
    ],

    // SPANISH 🇪🇸
    es: [

        {
            id: 'es-a1-1',
            title: 'La Alhambra en Granada',
            level: 'A1',
            wordCount: 50,
            content: `La Alhambra está en Granada, España. Es un palacio muy antiguo. Tiene paredes rojas y jardines bonitos. Hace muchos años, viven allí reyes. Hay agua, fuentes y flores. Hoy muchas personas visitan la Alhambra. Sacan fotos y caminan por los patios. La Alhambra es muy famosa.`
        },
        {
            id: 'es-a1-2',
            title: 'Cristóbal Colón y el viaje',
            level: 'A1',
            wordCount: 50,
            content: `Cristóbal Colón es navegante. Él quiere llegar a la India. Sale con tres barcos. El viaje es largo. Los marineros tienen miedo. Un día ven tierra. Colón llega a un lugar nuevo. Su viaje es muy conocido.`
        },
        {
            id: 'es-a1-3',
            title: 'La primera llegada a la Luna',
            level: 'A1',
            wordCount: 45,
            content: `En 1969, el mundo mira la televisión. Un astronauta llega a la Luna. Él se llama Neil Armstrong. Baja de la nave. Camina en la Luna. Muchas personas están sorprendidas. Es un momento histórico. Hoy la gente lo recuerda.`
        },
        {
            id: 'es-a1-4',
            title: 'Frida Kahlo',
            level: 'A1',
            wordCount: 45,
            content: `Frida Kahlo es una artista de México. Ella pinta muchos cuadros. Sus cuadros hablan de su vida. Frida tiene dolor, pero trabaja mucho. Ella usa ropa tradicional. Mucha gente la admira. Hoy Frida es famosa. Sus cuadros están en museos.`
        },
        {
            id: 'es-a1-5',
            title: 'El Camino de Santiago',
            level: 'A1',
            wordCount: 45,
            content: `En España hay un camino famoso. Se llama el Camino de Santiago. Muchas personas caminan muchos días. Ellos llevan mochila. Van por pueblos y ciudades. Al final llegan a Santiago. Están cansados, pero felices. El camino es muy conocido.`
        },
        {
            id: 'es-a1-6',
            title: 'Los romanos en España',
            level: 'A1',
            wordCount: 45,
            content: `Hace mucho tiempo, los romanos están en España. Construyen caminos y puentes. También construyen teatros. Las ciudades crecen. La gente aprende nuevas ideas. Hoy vemos ruinas romanas. Son parte de la historia. Los romanos son importantes.`
        },
        {
            id: 'es-a1-7',
            title: 'Machu Picchu',
            level: 'A1',
            wordCount: 50,
            content: `Machu Picchu está en Perú. Es una ciudad antigua en la montaña. Está muy alta y tiene piedras grandes. Hace muchos años viven allí los incas. Hoy llegan muchos turistas. Suben la montaña y miran el paisaje. Machu Picchu es muy especial. Es famoso en todo el mundo.`
        },
        {
            id: 'es-a1-8',
            title: 'El canal de Panamá',
            level: 'A1',
            wordCount: 45,
            content: `El canal de Panamá está en Panamá. Es un canal entre dos océanos. Los barcos pasan por el canal. Así el viaje es más corto. La construcción es difícil. Pero el canal se termina. Hoy es muy importante. Muchos barcos lo usan.`
        },
        {
            id: 'es-a1-9',
            title: 'Los Juegos Olímpicos',
            level: 'A1',
            wordCount: 45,
            content: `Los Juegos Olímpicos son un evento deportivo. Vienen atletas de muchos países. Hay correr, nadar y saltar. Los atletas entrenan mucho. Quieren ganar medallas. La gente mira y aplaude. Es una gran fiesta. Los Juegos Olímpicos son famosos.`
        },
        {
            id: 'es-a1-10',
            title: 'La caída del Muro de Berlín',
            level: 'A1',
            wordCount: 50,
            content: `En Berlín hay un muro por muchos años. El muro separa la ciudad. Muchas familias están separadas. En 1989, la gente quiere libertad. Van al muro y celebran. El muro cae. La ciudad se une otra vez. Es un día histórico.`
        },
        {
            id: 'es-a2-1',
            title: 'La Sagrada Familia en Barcelona',
            level: 'A2',
            wordCount: 85,
            content: `En Barcelona hay una iglesia muy famosa: la Sagrada Familia. El arquitecto Antoni Gaudí la diseñó hace más de cien años. La construcción empezó en 1882, pero todavía no está terminada. Mucha gente visita la ciudad solo para verla. La iglesia tiene torres altas y muchas formas diferentes. Gaudí quería que el edificio pareciera algo de la naturaleza. Después de su muerte, otros arquitectos continuaron el trabajo. Hoy la Sagrada Familia es un símbolo de Barcelona y un lugar muy importante para el turismo.`
        },
        {
            id: 'es-a2-2',
            title: 'La expedición de Magallanes',
            level: 'A2',
            wordCount: 90,
            content: `En 1519, Fernando de Magallanes salió de España con varios barcos. Quería encontrar una ruta por mar para llegar a Asia. El viaje fue muy largo y peligroso. Muchos marineros sufrieron hambre y enfermedades. Magallanes murió en una isla de Filipinas, pero una parte de la expedición continuó. En 1522, un barco volvió a Europa. Fue la primera vez que una expedición dio la vuelta al mundo. Este viaje cambió la historia de la navegación.`
        },
        {
            id: 'es-a2-3',
            title: 'La guerra civil española',
            level: 'A2',
            wordCount: 95,
            content: `En 1936 empezó la Guerra Civil en España. El país se dividió en dos bandos y hubo mucha violencia. Muchas ciudades fueron atacadas y mucha gente perdió su casa. También muchas personas tuvieron que salir del país para buscar seguridad. La guerra terminó en 1939, pero dejó heridas profundas. Durante muchos años, hablar del tema fue difícil. Hoy, la Guerra Civil sigue siendo un tema importante en la historia de España.`
        },
        {
            id: 'es-a2-4',
            title: 'El Imperio Inca y sus caminos',
            level: 'A2',
            wordCount: 95,
            content: `Los incas construyeron un gran imperio en América del Sur. Vivían en las montañas y tenían una organización fuerte. Para conectar sus ciudades, construyeron una red de caminos muy larga. Estos caminos pasaban por lugares difíciles, como montañas y valles. Los mensajeros corrían por los caminos para llevar noticias. También se movían alimentos y materiales. Hoy todavía se pueden ver partes de esos caminos, y algunos turistas los caminan para llegar a Machu Picchu.`
        },
        {
            id: 'es-a2-5',
            title: 'La llegada del hombre a la Luna',
            level: 'A2',
            wordCount: 95,
            content: `En 1969, la misión Apolo 11 llegó a la Luna. Millones de personas vieron el evento en la televisión. Neil Armstrong bajó del módulo y caminó sobre la superficie. Fue un momento muy importante porque mostró el poder de la ciencia y la tecnología. La misión fue peligrosa, pero salió bien. Después, otros astronautas también viajaron a la Luna. Hoy, la llegada a la Luna sigue siendo uno de los eventos más famosos del siglo XX.`
        },
        {
            id: 'es-a2-6',
            title: 'La creación de la Unión Europea',
            level: 'A2',
            wordCount: 100,
            content: `Después de la Segunda Guerra Mundial, muchos países de Europa querían evitar otra guerra. Por eso empezaron a cooperar en economía y política. Con el tiempo, esa cooperación se hizo más grande y nació la Unión Europea. La idea era compartir reglas y trabajar juntos. En muchos países, las fronteras se hicieron más abiertas y la gente pudo viajar más fácilmente. También se creó una moneda común en varios países: el euro. La Unión Europea influye hoy en la vida de millones de personas.`
        },
        {
            id: 'es-a2-7',
            title: 'La pandemia de gripe de 1918',
            level: 'A2',
            wordCount: 95,
            content: `En 1918, una gripe muy fuerte se extendió por el mundo. Mucha gente estaba débil por la Primera Guerra Mundial, y la medicina no tenía buenas soluciones. La enfermedad se movía rápido entre países y ciudades. En muchos lugares cerraron escuelas y prohibieron grandes reuniones. Murieron millones de personas. Con el tiempo, la pandemia terminó, pero dejó una gran lección: las enfermedades pueden viajar rápido y es importante reaccionar pronto para proteger a la población.`
        },
        {
            id: 'es-a2-8',
            title: 'El Canal de Suez',
            level: 'A2',
            wordCount: 90,
            content: `Antes, los barcos que iban de Europa a Asia tenían que viajar alrededor de África. Eso tardaba mucho tiempo. En el siglo XIX, se construyó el Canal de Suez en Egipto. El canal se abrió en 1869 y cambió el comercio mundial. Ahora los barcos podían ahorrar muchos días de viaje. La construcción fue difícil y costó muchas vidas, pero el resultado fue importante. Hoy el canal sigue siendo una ruta clave para el transporte internacional.`
        },
        {
            id: 'es-a2-9',
            title: 'El descubrimiento de la tumba de Tutankamón',
            level: 'A2',
            wordCount: 95,
            content: `En 1922, el arqueólogo Howard Carter encontró la tumba del faraón Tutankamón en Egipto. Había buscado durante muchos años. Cuando abrió la tumba, vio objetos de oro y cosas muy bien conservadas. El hallazgo fue una noticia mundial y despertó mucho interés por el antiguo Egipto. Muchas personas empezaron a leer sobre faraones y pirámides. Hoy, los objetos de Tutankamón están en museos y siguen siendo muy famosos.`
        },
        {
            id: 'es-a2-10',
            title: 'La primera mujer en el espacio',
            level: 'A2',
            wordCount: 95,
            content: `En 1963, Valentina Tereshkova se convirtió en la primera mujer en viajar al espacio. Era de la Unión Soviética y su misión fue muy importante. Durante el vuelo, dio varias vueltas alrededor de la Tierra. Mucha gente siguió la noticia con emoción. Para muchas mujeres, ella fue un ejemplo: mostró que también podían participar en la ciencia y en la exploración espacial. Su viaje quedó en la historia como un gran paso en la carrera espacial.`
        },
        {
            id: 'es-b1-1',
            title: 'La primera vuelta al mundo en solitario',
            level: 'B1',
            wordCount: 140,
            content: `En 1968, un marinero británico llamado Robin Knox-Johnston salió a navegar con un objetivo muy ambicioso: dar la vuelta al mundo sin paradas y sin ayuda. En esa época, la tecnología era limitada y no existían GPS modernos como hoy. Durante meses, estuvo solo en el océano, con tormentas fuertes, frío y cansancio constante. Tenía que reparar el barco, planear la ruta y cuidar la comida y el agua. Además, la soledad era un problema real: no podía hablar con nadie cara a cara. Después de más de 300 días, regresó a Inglaterra y se convirtió en el primer hombre en completar esa hazaña. Su historia es importante porque muestra disciplina, resistencia mental y la capacidad de tomar decisiones bajo presión.`
        },
        {
            id: 'es-b1-2',
            title: 'La caída del Imperio azteca (1521)',
            level: 'B1',
            wordCount: 135,
            content: `Cuando los españoles llegaron a México, encontraron un imperio muy organizado: el Imperio azteca, con su capital Tenochtitlan. Hernán Cortés formó alianzas con pueblos que eran enemigos de los aztecas, porque muchos estaban cansados de pagar tributos. También hubo un factor decisivo: las enfermedades traídas desde Europa, como la viruela, afectaron gravemente a la población local. Tras meses de conflicto, en 1521 Tenochtitlan cayó. El evento cambió la historia de América, porque comenzó un nuevo sistema político y social. Para muchas comunidades, fue un tiempo de gran pérdida; para otros, una oportunidad de cambiar el poder en la región. Hasta hoy, este tema genera debate sobre conquista, resistencia y memoria histórica.`
        },
        {
            id: 'es-b1-3',
            title: 'La independencia de México (1810–1821)',
            level: 'B1',
            wordCount: 140,
            content: `A comienzos del siglo XIX, en México existía una gran desigualdad social y política. Muchos criollos y mestizos sentían que no tenían las mismas oportunidades que los nacidos en España. En 1810, el sacerdote Miguel Hidalgo hizo un llamado a la rebelión, conocido como el “Grito de Dolores”. Aunque Hidalgo fue capturado y ejecutado, el movimiento continuó con otros líderes como José María Morelos. La guerra fue larga y dejó muchas víctimas, pero también creó una idea fuerte: México debía decidir su propio futuro. En 1821 se firmó la independencia. Sin embargo, el país no se volvió estable de inmediato; después vinieron conflictos internos y cambios de gobierno. Aun así, la independencia se recuerda como el inicio de una identidad nacional más clara.`
        },
        {
            id: 'es-b1-4',
            title: 'La abolición de la esclavitud en Brasil',
            level: 'B1',
            wordCount: 135,
            content: `Brasil fue uno de los últimos países de América en abolir la esclavitud. Durante siglos, millones de africanos fueron obligados a trabajar en plantaciones y ciudades. En el siglo XIX, crecieron los movimientos abolicionistas, y también aumentó la presión internacional. Además, muchas personas esclavizadas escapaban o negociaban su libertad, y la economía empezaba a cambiar. Finalmente, en 1888, la princesa Isabel firmó la “Ley Áurea”, que abolió la esclavitud. La decisión fue histórica, pero no solucionó todos los problemas: muchas personas liberadas quedaron sin tierra, sin educación y sin apoyo del Estado. Por eso, la abolición es un ejemplo de un gran avance legal que no siempre viene acompañado de justicia social inmediata. Hasta hoy, Brasil sigue discutiendo sus consecuencias.`
        },
        {
            id: 'es-b1-5',
            title: 'El descubrimiento de la tumba del “Señor de Sipán”',
            level: 'B1',
            wordCount: 145,
            content: `En 1987, en el norte de Perú, los arqueólogos hicieron un hallazgo impresionante: la tumba del Señor de Sipán, un gobernante de la cultura moche. Al principio, hubo un problema grave: saqueadores robaban objetos para venderlos. Cuando el Estado intervino, comenzó una excavación científica que reveló joyas, máscaras y vestimentas muy bien conservadas. Lo más importante fue que la tumba estaba casi intacta, algo raro en la arqueología. Gracias a este descubrimiento, muchas personas entendieron mejor la historia preincaica del Perú, que a veces recibe menos atención que los incas. También se impulsó la creación de museos y proyectos culturales en la región. El caso muestra cómo el patrimonio puede perderse rápidamente si no se protege, y cómo una investigación seria puede cambiar lo que sabemos del pasado.`
        },
        {
            id: 'es-b1-6',
            title: 'El primer vuelo de los hermanos Wright',
            level: 'B1',
            wordCount: 140,
            content: `A principios del siglo XX, muchas personas soñaban con volar, pero parecía imposible controlar una máquina en el aire. En 1903, los hermanos Wright, Orville y Wilbur, lograron un avance decisivo en Estados Unidos. Construyeron un avión ligero y diseñaron un sistema para controlar el movimiento, algo tan importante como el motor. El primer vuelo duró pocos segundos, pero fue suficiente para demostrar que la idea funcionaba. Al principio, no todo el mundo creyó en su éxito, y tuvieron que repetir pruebas y mejorar el diseño. Con el tiempo, la aviación se desarrolló rápidamente y transformó el mundo: viajes más cortos, comercio más global y también nuevas formas de guerra. Esta historia muestra que un cambio enorme puede empezar con un experimento pequeño, siempre que haya paciencia, método y mejora continua.`
        },
        {
            id: 'es-b1-7',
            title: 'La construcción del Canal de Corinto',
            level: 'B1',
            wordCount: 130,
            content: `En Grecia existe un canal muy estrecho que corta el istmo de Corinto y conecta dos mares. La idea de construirlo era antigua, pero el proyecto se realizó en 1893. El objetivo era ahorrar tiempo a los barcos, porque rodear el Peloponeso era más largo y peligroso. Sin embargo, la construcción fue complicada: hubo problemas técnicos, derrumbes y costos altos. Al final, el canal quedó terminado, pero su ancho es limitado, así que no todos los barcos pueden usarlo. Aun así, el Canal de Corinto es un ejemplo interesante de cómo una obra puede ser valiosa incluso si no es perfecta. También muestra que la ingeniería muchas veces depende de la geografía y del dinero disponible. Hoy es famoso y atrae tanto a barcos pequeños como a turistas.`
        },
        {
            id: 'es-b1-8',
            title: 'El voto femenino en España (1931)',
            level: 'B1',
            wordCount: 140,
            content: `En 1931, durante la Segunda República, España vivió un debate intenso sobre el derecho al voto de las mujeres. La diputada Clara Campoamor defendió la idea con mucha fuerza: si una democracia es real, debe incluir a toda la población adulta. Sin embargo, incluso algunas personas progresistas tenían dudas y pensaban que las mujeres votarían influenciadas por la Iglesia o la familia. A pesar de la polémica, el derecho fue aprobado y las mujeres votaron por primera vez en elecciones generales en 1933. El evento fue un paso histórico hacia la igualdad política. Aunque después la dictadura eliminó muchas libertades, el debate de 1931 quedó como símbolo de un avance importante. La historia también enseña que los derechos no siempre llegan “cuando es cómodo”, sino cuando alguien insiste en que son justos.`
        },
        {
            id: 'es-b1-9',
            title: 'El descubrimiento de la estructura del ADN',
            level: 'B1',
            wordCount: 145,
            content: `En 1953, los científicos James Watson y Francis Crick presentaron un modelo para explicar la estructura del ADN: una doble hélice. Este descubrimiento fue clave para entender cómo se guarda y se transmite la información genética. Sin embargo, la historia también incluye a Rosalind Franklin, cuyas imágenes de difracción de rayos X ayudaron a identificar la forma del ADN. En esa época, la competencia científica era fuerte y no siempre se reconocía el trabajo de todos por igual. Con el tiempo, el conocimiento del ADN permitió avances enormes: medicina, biología, investigación de enfermedades y hasta pruebas de identidad. Pero también abrió debates éticos sobre privacidad genética y manipulación. Este evento es famoso porque muestra dos cosas al mismo tiempo: el poder de la ciencia para explicar la vida y la importancia de la colaboración (y del reconocimiento justo) en el trabajo científico.`
        },
        {
            id: 'es-b1-10',
            title: 'La erupción del Krakatoa (1883)',
            level: 'B1',
            wordCount: 135,
            content: `En 1883, el volcán Krakatoa, en Indonesia, entró en erupción con una fuerza extraordinaria. La explosión fue tan grande que se escuchó a miles de kilómetros. Además, provocó tsunamis que destruyeron pueblos costeros y causaron muchas muertes. El evento no fue solo local: la ceniza volcánica subió a la atmósfera y afectó el clima durante meses. En varios lugares del mundo, las personas observaron atardeceres de colores intensos y extraños, sin saber la causa. Krakatoa se convirtió en un ejemplo claro de cómo la naturaleza puede influir en todo el planeta. También impulsó el interés científico por los volcanes y por el estudio de riesgos naturales. Esta historia es útil porque conecta geografía, ciencia y vida humana: un fenómeno en un punto del mapa puede tener consecuencias globales.`
        },
        {
            id: 'es-b2-1',
            title: 'La expedición de Shackleton y la supervivencia en el hielo',
            level: 'B2',
            wordCount: 250,
            content: `En 1914, Ernest Shackleton organizó la Expedición Imperial Transantártica con un objetivo que sonaba casi imposible: cruzar la Antártida a pie. La Primera Guerra Mundial acababa de empezar, pero él insistió en que la misión sería un símbolo de resistencia. El plan, sin embargo, se rompió antes de comenzar. Su barco, el *Endurance*, quedó atrapado en el hielo del mar de Weddell y, tras meses de presión, fue aplastado y se hundió. En lugar de una aventura “heroica”, el equipo se enfrentó a una lucha diaria por sobrevivir.

Lo más impresionante no fue la exploración, sino el liderazgo. Shackleton entendió que su prioridad era mantener la disciplina y el ánimo. Organizó rutinas, repartió tareas y evitó conflictos internos. Durante semanas vivieron sobre placas de hielo que se movían y se fracturaban. Cuando ya no pudieron seguir, usaron botes salvavidas para llegar a la isla Elefante. Allí, Shackleton tomó una decisión arriesgada: cruzar el océano abierto en un bote pequeño hasta Georgia del Sur para pedir ayuda.

El viaje fue brutal: frío, olas enormes, navegación casi a ciegas. Aun así, Shackleton llegó y regresó con un rescate. Lo increíble es que, pese al desastre total del plan original, ningún miembro del equipo murió. Por eso esta historia se recuerda como una lección sobre gestión de crisis: cuando la meta desaparece, la misión real se convierte en salvar a las personas.`
        },
        {
            id: 'es-b2-2',
            title: 'La Revolución de los Claveles en Portugal (1974)',
            level: 'B2',
            wordCount: 250,
            content: `Durante décadas, Portugal vivió bajo una dictadura que controlaba la prensa, perseguía a opositores y mantenía guerras coloniales costosas en África. A comienzos de los años setenta, muchos militares estaban agotados: veían que el país gastaba recursos enormes en conflictos sin salida, mientras la población vivía con pocas oportunidades. En ese contexto, un grupo de oficiales jóvenes organizó un golpe para terminar con el régimen.

La madrugada del 25 de abril de 1974, señales en la radio confirmaron que el plan estaba en marcha. Los militares ocuparon puntos estratégicos, pero ocurrió algo inesperado: la gente salió a la calle para apoyar el cambio. En lugar de enfrentamientos masivos, se creó una imagen que dio nombre al evento. Civiles colocaron claveles rojos en los fusiles de los soldados, como símbolo de una transición que buscaba evitar la sangre.

La caída del régimen no resolvió todo de inmediato. Hubo meses de incertidumbre, debates ideológicos y tensiones económicas. Sin embargo, el resultado final fue una apertura política que permitió elecciones libres y una nueva constitución democrática. Además, Portugal aceleró el fin de sus guerras coloniales y comenzó la descolonización, un proceso difícil pero inevitable.

La Revolución de los Claveles se recuerda porque muestra una idea rara en la historia: un cambio de poder impulsado por militares, pero empujado por la sociedad hacia una solución relativamente pacífica. También demuestra que la legitimidad no se sostiene solo con fuerza; cuando una mayoría pierde el miedo, incluso un sistema rígido puede caer en cuestión de horas.`
        },
        {
            id: 'es-b2-3',
            title: 'El juicio de Núremberg: justicia después del horror',
            level: 'B2',
            wordCount: 250,
            content: `Tras la Segunda Guerra Mundial, Europa estaba devastada y el mundo conocía detalles cada vez más claros sobre el Holocausto y los crímenes cometidos por el régimen nazi. En 1945, las potencias aliadas decidieron organizar un tribunal internacional para juzgar a líderes políticos y militares responsables de crímenes de guerra, crímenes contra la humanidad y otros delitos. Así nacieron los Juicios de Núremberg, un experimento jurídico y político sin precedentes.

El objetivo no era solo castigar. También se buscaba establecer un registro público de lo ocurrido, con documentos, testimonios y pruebas. Eso era importante porque muchos intentaban negar o minimizar los hechos. En la sala del tribunal aparecieron argumentos complejos: algunos acusados afirmaban que solo obedecían órdenes, otros insistían en que las leyes del momento “permitían” ciertas acciones. El tribunal, sin embargo, defendió un principio fundamental: hay límites éticos que ningún Estado puede cruzar, y la obediencia no elimina la responsabilidad individual.

Núremberg fue criticado por distintas razones. A pesar de esas críticas, el impacto fue enorme. El proceso ayudó a construir conceptos legales que luego influirían en tribunales internacionales y en la idea moderna de derechos humanos.

La lección principal es incómoda pero necesaria: la barbarie puede ser organizada y burocrática, y por eso la justicia también debe ser sistemática, pública y documentada. Sin memoria y sin normas, el “nunca más” se convierte en una frase vacía.`
        },
        {
            id: 'es-b2-4',
            title: 'La huelga de los astilleros de Gdansk',
            level: 'B2',
            wordCount: 250,
            content: `En 1980, Polonia era un país comunista con una economía deteriorada: escasez de productos, precios en aumento y una sociedad cansada de promesas. En los astilleros de Gdansk, una decisión aparentemente “pequeña” encendió la chispa: el despido de una trabajadora y el malestar acumulado por condiciones laborales injustas. Los trabajadores iniciaron una huelga que rápidamente se convirtió en un movimiento social.

El liderazgo de Lech Wałęsa fue clave. No se trataba solo de pedir mejores salarios, sino de exigir derechos más amplios: sindicatos independientes, libertad de expresión y respeto a la dignidad del trabajador. Lo sorprendente fue la forma de organización: asambleas, comités, negociaciones, y una disciplina que evitaba la violencia abierta. En un sistema donde el Estado controlaba casi todo, el simple hecho de un sindicato autónomo era una amenaza.

El gobierno intentó contener el movimiento, pero al final firmó acuerdos que reconocían a Solidaridad como sindicato legal. Aunque luego llegó la ley marcial y la represión, la idea ya había cambiado: la sociedad descubrió que podía organizarse fuera del control total del partido. Solidaridad se convirtió en un símbolo para otros países del bloque del Este, porque demostraba que la oposición podía ser masiva y persistente.

Con el tiempo, estos movimientos contribuyeron a la caída de regímenes comunistas en Europa Oriental. La historia de Gdansk enseña que las transformaciones políticas no siempre nacen en parlamentos; a veces nacen en talleres, fábricas y espacios cotidianos, donde la gente decide que la normalidad ya no es aceptable.`
        },
        {
            id: 'es-b2-5',
            title: 'El terremoto de 1985 en Ciudad de México',
            level: 'B2',
            wordCount: 250,
            content: `El 19 de septiembre de 1985, un terremoto sacudió Ciudad de México y cambió la vida de millones de personas en cuestión de minutos. Lo que lo hizo especialmente destructivo fue una combinación de factores: la magnitud del sismo, la distancia al epicentro y, sobre todo, el tipo de suelo en ciertas zonas de la ciudad, que amplificó las vibraciones. Edificios enteros colapsaron, hospitales quedaron inutilizados y miles de familias perdieron casa y seres queridos.

En las primeras horas, la respuesta oficial fue confusa. Hubo falta de coordinación, comunicación lenta y decisiones que parecían desconectadas de la realidad en las calles. Sin embargo, lo más recordado del terremoto es la reacción social. Vecinos, estudiantes y trabajadores formaron brigadas espontáneas para remover escombros, rescatar personas y repartir comida. Muchos aprendieron técnicas básicas en el momento: organizar turnos, crear cadenas humanas, clasificar materiales y actuar con cuidado para no causar más derrumbes.

Esa movilización dejó un impacto duradero. Por un lado, aceleró cambios en normas de construcción y en la conciencia sobre riesgos sísmicos. Por otro, transformó la relación entre ciudadanía y Estado: mucha gente sintió que la sociedad civil había respondido cuando las instituciones fallaban. A partir de ese trauma, crecieron organizaciones comunitarias y nuevas formas de participación pública.

La historia del terremoto de 1985 no es solo una tragedia natural; también es un ejemplo de cómo, en medio del caos, la solidaridad puede convertirse en una fuerza política y cultural. Cuando el suelo tiembla, se revela qué tan fuertes son las redes humanas.`
        },
        {
            id: 'es-b2-6',
            title: 'La caída del apartheid',
            level: 'B2',
            wordCount: 250,
            content: `Durante décadas, Sudáfrica vivió bajo el apartheid, un sistema legal que separaba a la población por raza y limitaba derechos básicos para la mayoría negra. La represión era cotidiana: detenciones, censura y violencia. Aun así, surgieron movimientos de resistencia, y uno de los símbolos más importantes fue Nelson Mandela, encarcelado durante años. Hacia finales de los años ochenta, el sistema comenzó a mostrar grietas. La presión internacional aumentó, la economía se debilitó y la violencia interna crecía.

En 1990, la liberación de Mandela fue un gesto que cambió el tablero. Pero el fin del apartheid no fue automático. Lo difícil era evitar que el país entrara en una espiral de venganza. Mandela y el presidente F. W. de Klerk iniciaron negociaciones para crear un sistema democrático. Hubo sabotajes, ataques y miedo, porque muchos sectores temían perder poder o seguridad. Sin embargo, el proceso avanzó: se legalizaron partidos, se redactaron acuerdos y se prepararon elecciones inclusivas.

En 1994, millones de personas votaron por primera vez sin restricciones raciales. La imagen de filas enormes de votantes fue histórica. Mandela ganó y asumió la presidencia con un discurso que buscaba unir, no humillar. Después, la Comisión de la Verdad y Reconciliación intentó enfrentar crímenes del pasado mediante testimonios públicos, un mecanismo imperfecto pero significativo.

Esta transición se recuerda porque eligió, en gran medida, la negociación sobre la guerra total. No eliminó la desigualdad de un día para otro, pero cambió la estructura legal y moral del país. Es un ejemplo de cómo la política puede ser, al mismo tiempo, memoria del dolor y apuesta por el futuro.`
        },
        {
            id: 'es-b2-7',
            title: 'La apertura del Canal de Kiel',
            level: 'B2',
            wordCount: 250,
            content: `A finales del siglo XIX, Alemania buscaba consolidarse como potencia industrial y naval. Un problema estratégico era la distancia marítima entre el mar del Norte y el mar Báltico: los barcos tenían que rodear Dinamarca, lo que implicaba tiempo extra y riesgos. La solución fue una obra monumental: el Canal de Kiel, inaugurado en 1895. Conectaba ambos mares y permitía mover flotas y mercancías de manera mucho más rápida.

El canal no fue solo un proyecto técnico; fue un mensaje político. Construir una infraestructura capaz de cambiar rutas marítimas significaba controlar el ritmo del comercio y aumentar la capacidad militar. La ingeniería tuvo que enfrentarse a desafíos importantes: excavación masiva, gestión de agua, estabilidad de márgenes, y coordinación de miles de trabajadores. Aunque hoy esas obras parecen “normales”, en su época representaban un salto en capacidad organizativa.

La apertura del canal aceleró el transporte de carbón, acero y productos industriales. También modificó el equilibrio en el norte de Europa: quien controla pasos estratégicos influye en precios, tiempos y seguridad. Con el tiempo, el canal fue ampliado para acomodar barcos más grandes, lo que muestra una idea clave: la infraestructura no es estática; debe adaptarse a la tecnología y al tamaño del comercio mundial.

La historia del Canal de Kiel recuerda que la ingeniería es política en forma de concreto y agua. Una obra puede reducir distancias sin mover el mapa, y puede transformar una región sin conquistarla. En el fondo, muchos “poderes” modernos se construyen menos con fronteras y más con rutas, cables, puertos y canales.`
        },
        {
            id: 'es-b2-8',
            title: 'El caso Watergate',
            level: 'B2',
            wordCount: 250,
            content: `En 1972, durante la campaña presidencial de Estados Unidos, un grupo fue detenido por entrar ilegalmente en la sede del Partido Demócrata, ubicada en el complejo Watergate. Al principio, parecía un caso menor de espionaje político. Sin embargo, periodistas y jueces detectaron conexiones con personas cercanas al presidente Richard Nixon. Lo que convirtió el caso en una crisis histórica no fue solo el robo, sino el encubrimiento: intentos de bloquear investigaciones, manipular pruebas y usar instituciones para proteger al gobierno.

La prensa desempeñó un papel decisivo. Con filtraciones, verificación de datos y presión pública, el tema dejó de ser un rumor y se volvió un escándalo nacional. A medida que avanzaban las investigaciones, surgió un elemento crucial: grabaciones secretas de conversaciones en la Casa Blanca. Esas cintas mostraban cómo se hablaba del caso internamente y hasta qué punto se intentaba controlarlo. La lucha por obtener y publicar esas pruebas creó un choque entre el ejecutivo, el Congreso y el sistema judicial.

Finalmente, cuando la evidencia fue imposible de negar, Nixon renunció en 1974. Fue la primera vez que un presidente estadounidense dimitía. Watergate dejó una herencia ambivalente. Por un lado, fortaleció la idea de que nadie está por encima de la ley y que la separación de poderes puede funcionar. Por otro, aumentó el cinismo público hacia la política y alimentó la desconfianza.

El caso se recuerda porque demuestra que las democracias no dependen solo de elecciones, sino también de mecanismos de control: periodismo, tribunales, parlamentos y ciudadanía activa. Sin vigilancia, el poder tiende a protegerse; con vigilancia, al menos existe la posibilidad de corregirlo.`
        },
        {
            id: 'es-b2-9',
            title: 'La gran hambruna irlandesa y la migración masiva',
            level: 'B2',
            wordCount: 250,
            content: `En la década de 1840, Irlanda sufrió una crisis devastadora conocida como la Gran Hambruna. El detonante fue una plaga que destruyó la cosecha de patata, alimento básico para una gran parte de la población. Pero la tragedia no puede explicarse solo por una enfermedad agrícola. Irlanda vivía bajo un sistema económico desigual: muchos campesinos dependían de pequeñas parcelas y pagaban rentas altas, mientras gran parte de la producción agrícola se orientaba al mercado y a propietarios ausentes.

Cuando la patata falló, millones quedaron sin comida. Las respuestas políticas fueron insuficientes y, en ocasiones, ideológicas: algunos responsables defendían que el mercado se “ajustaría” solo. Mientras tanto, la gente moría o se debilitaba hasta caer enferma. Se calcula que murieron alrededor de un millón de personas y que otro millón emigró, especialmente a Estados Unidos, Canadá y Reino Unido. Los viajes eran peligrosos; muchos barcos iban hacinados y con malas condiciones sanitarias.

La hambruna cambió Irlanda para siempre. Redujo la población, alteró la estructura familiar y aumentó el resentimiento hacia el gobierno británico, lo que influiría en movimientos nacionalistas posteriores. También transformó a países receptores de migración: comunidades irlandesas crecieron en ciudades como Nueva York o Boston, aportando cultura y fuerza laboral, pero enfrentando discriminación.

Este episodio es un recordatorio de que las catástrofes “naturales” se vuelven tragedias humanas cuando se combinan con desigualdad, malas decisiones y ausencia de protección social. La migración masiva fue, en parte, una estrategia de supervivencia; en parte, una expulsión silenciosa causada por estructuras que ya eran frágiles antes de la plaga.`
        },
        {
            id: 'es-b2-10',
            title: 'La crisis del petróleo de 1973',
            level: 'B2',
            wordCount: 250,
            content: `En 1973, un conflicto en Oriente Medio desencadenó una de las crisis económicas más influyentes del siglo XX: la crisis del petróleo. Varios países productores, organizados en torno a la OPEP, redujeron exportaciones y aplicaron embargos a ciertos países. El resultado fue inmediato: el precio del petróleo subió con fuerza, y como muchas economías dependían de energía barata, el golpe se sintió en casi todos los sectores.

De repente, lo cotidiano cambió. Hubo colas en gasolineras, restricciones de consumo y una sensación de vulnerabilidad. Pero lo más relevante fue el efecto estructural: la inflación aumentó al mismo tiempo que el crecimiento se frenaba, una combinación difícil de manejar. Empresas con costos energéticos altos perdieron competitividad, y varios gobiernos se dieron cuenta de que su prosperidad dependía de decisiones tomadas fuera de sus fronteras.

La crisis también cambió la forma de pensar la energía. Algunos países aceleraron programas de ahorro y eficiencia; otros apostaron por energía nuclear; otros intentaron diversificar proveedores. Además, se fortaleció la idea de “seguridad energética”, es decir, la necesidad de proteger el acceso a recursos estratégicos como si fueran parte de la defensa nacional.

A nivel social, la crisis dejó una lección: el progreso industrial no es solo tecnología; es también acceso estable a energía. Cuando esa base tiembla, todo el edificio se resiente: transporte, alimentos, producción y empleo. Por eso, 1973 sigue siendo una referencia cuando se habla de dependencia, globalización y transición energética. Incluso hoy, cada debate sobre precios, combustibles o energías renovables tiene una sombra histórica que viene de aquella ruptura.`
        }
    ],

    // FRENCH 🇫🇷
    fr: [
        {
            id: 'fr-a1-1',
            title: 'La Tour Eiffel',
            level: 'A1',
            wordCount: 50,
            content: `En 1889, Paris prépare une grande exposition. On construit une tour très haute. Elle s’appelle la Tour Eiffel. Gustave Eiffel est l’ingénieur. Beaucoup de personnes disent: « C’est trop grand ! » Mais la tour est finie. Aujourd’hui, beaucoup de touristes la visitent. La Tour Eiffel est un symbole de Paris.`
        },
        {
            id: 'fr-a1-2',
            title: 'Jeanne d’Arc',
            level: 'A1',
            wordCount: 45,
            content: `Jeanne est une jeune fille en France. Il y a une guerre. Jeanne veut aider son pays. Elle parle aux soldats. Elle donne du courage. Les gens la suivent. Plus tard, son histoire devient très célèbre. Aujourd’hui, beaucoup de Français la connaissent.`
        },
        {
            id: 'fr-a1-3',
            title: 'Marie Curie',
            level: 'A1',
            wordCount: 45,
            content: `Marie Curie vit en France. Elle travaille beaucoup à l’université. Elle étudie la science. Elle découvre des choses sur la radioactivité. Son travail est très important. Elle reçoit un grand prix. Beaucoup de personnes respectent Marie Curie. Aujourd’hui, son nom est célèbre.`
        },
        {
            id: 'fr-a1-4',
            title: 'Louis Pasteur et le vaccin',
            level: 'A1',
            wordCount: 50,
            content: `Louis Pasteur est un scientifique français. Il travaille sur les maladies. Il veut aider les gens. Il fait des expériences. Il crée un vaccin contre la rage. Des personnes peuvent vivre grâce à ce vaccin. Pasteur devient très connu. Aujourd’hui, on parle encore de lui.`
        },
        {
            id: 'fr-a1-5',
            title: 'La Statue de la Liberté',
            level: 'A1',
            wordCount: 50,
            content: `La France fait un cadeau aux États-Unis. C’est une grande statue. Elle s’appelle la Statue de la Liberté. On la construit en France. Puis on l’envoie en bateau. Elle arrive à New York. Beaucoup de gens la voient. Aujourd’hui, elle est très célèbre.`
        },
        {
            id: 'fr-a1-6',
            title: 'Le premier avion',
            level: 'A1',
            wordCount: 45,
            content: `Deux frères vivent aux États-Unis. Ils s’appellent les frères Wright. Ils veulent voler. Ils construisent un petit avion. Un jour, l’avion décolle. Il vole quelques secondes. C’est un moment important. Après, les avions changent le monde.`
        },
        {
            id: 'fr-a1-7',
            title: 'La découverte de la tombe de Toutankhamon',
            level: 'A1',
            wordCount: 50,
            content: `En Égypte, un homme cherche une tombe. Il s’appelle Howard Carter. Il cherche pendant longtemps. Un jour, il trouve une porte. Il entre dans une tombe. Il voit beaucoup d’objets en or. C’est la tombe de Toutankhamon. La découverte devient très célèbre.`
        },
        {
            id: 'fr-a1-8',
            title: 'La première voiture',
            level: 'A1',
            wordCount: 50,
            content: `Avant, les gens voyagent à cheval. Puis, des inventeurs construisent une voiture. La voiture a un moteur. Au début, elle est lente et bruyante. Mais c’est une nouveauté. Les gens sont surpris. Avec le temps, il y a plus de voitures. Aujourd’hui, la voiture est partout.`
        },
        {
            id: 'fr-a1-9',
            title: 'La Révolution française',
            level: 'A1',
            wordCount: 50,
            content: `En France, il y a un roi. Beaucoup de personnes sont pauvres. Ils veulent du changement. En 1789, les gens sont très en colère. Ils vont à Paris. Ils prennent une prison: la Bastille. C’est un moment important. La France change beaucoup après ça.`
        },
        {
            id: 'fr-a1-10',
            title: 'Le canal de Panama',
            level: 'A1',
            wordCount: 50,
            content: `Il y a un endroit entre deux océans. Les bateaux doivent faire un long voyage. Alors, des gens construisent un canal. Il s’appelle le canal de Panama. La construction est très difficile. Mais le canal est fini. Les bateaux passent plus vite. Aujourd’hui, le canal est très important.`
        },
        {
            id: 'fr-a2-1',
            title: 'L’invention du cinéma',
            level: 'A2',
            wordCount: 80,
            content: `À la fin du 19e siècle, les gens découvrent une nouvelle idée: des images qui bougent. En France, les frères Lumière inventent une machine pour filmer et montrer des scènes. En 1895, ils organisent une projection à Paris. Les spectateurs sont surpris, parce qu’ils n’ont jamais vu ça. Les films sont très courts, mais ils impressionnent tout le monde. Petit à petit, le cinéma devient un grand divertissement dans le monde entier.`
        },
        {
            id: 'fr-a2-2',
            title: 'Le voyage de Magellan',
            level: 'A2',
            wordCount: 90,
            content: `Fernand de Magellan veut faire un voyage très difficile: passer par la mer pour aller en Asie. En 1519, il part avec plusieurs bateaux. Le voyage est long, et beaucoup de marins souffrent de faim et de maladies. Magellan ne termine pas le voyage, mais une partie de son équipe continue. En 1522, un bateau revient en Europe. C’est la première fois que des hommes font le tour du monde.`
        },
        {
            id: 'fr-a2-3',
            title: 'Le premier vaccin',
            level: 'A2',
            wordCount: 95,
            content: `Au 18e siècle, la variole est une maladie très dangereuse. Beaucoup de personnes tombent malades et meurent. Un médecin anglais, Edward Jenner, remarque quelque chose d’intéressant: des personnes qui ont une maladie légère appelée “vaccine” ne prennent pas la variole. Alors, il fait une expérience et crée un premier vaccin. Après, la médecine progresse beaucoup. Cette idée aide à sauver des millions de vies.`
        },
        {
            id: 'fr-a2-4',
            title: 'Le naufrage du Titanic',
            level: 'A2',
            wordCount: 90,
            content: `En 1912, le Titanic est un des plus grands bateaux du monde. Beaucoup de passagers pensent qu’il est très sûr. Le bateau part d’Europe pour aller aux États-Unis. Pendant la nuit, il touche un iceberg. L’eau entre dans le bateau, et le Titanic coule. Il n’y a pas assez de canots de sauvetage. Après cette catastrophe, les règles de sécurité sur la mer deviennent plus strictes.`
        },
        {
            id: 'fr-a2-5',
            title: 'La fin d’une guerre en Europe',
            level: 'A2',
            wordCount: 95,
            content: `En 1945, la Seconde Guerre mondiale se termine en Europe. Pendant plusieurs années, beaucoup de pays souffrent: il y a des combats, des destructions et beaucoup de morts. Quand la guerre finit, les gens se sentent soulagés, mais aussi fatigués. Les villes doivent être reconstruites, et de nombreuses familles cherchent leurs proches. Après, plusieurs pays décident de coopérer pour éviter une nouvelle guerre.`
        },
        {
            id: 'fr-a2-6',
            title: 'Le premier homme dans l’espace',
            level: 'A2',
            wordCount: 95,
            content: `En 1961, un homme fait un voyage incroyable. Il s’appelle Youri Gagarine et il vient de l’Union soviétique. Il monte dans une capsule spatiale et il fait un tour autour de la Terre. Le vol ne dure pas très longtemps, mais il devient célèbre partout. Beaucoup de gens suivent la mission à la radio et à la télévision. Cette aventure marque le début d’une nouvelle époque: l’exploration spatiale.`
        },
        {
            id: 'fr-a2-7',
            title: 'La construction du métro',
            level: 'A2',
            wordCount: 90,
            content: `Au début du 20e siècle, les grandes villes grandissent très vite. Il y a trop de voitures et trop de monde dans les rues. Alors, des ingénieurs construisent des trains sous la terre: le métro. À Paris, le métro devient très important pour les travailleurs et les étudiants. Les gens peuvent se déplacer plus rapidement. Aujourd’hui, beaucoup de villes dans le monde utilisent le métro chaque jour.`
        },
        {
            id: 'fr-a2-8',
            title: 'Le grand tremblement de terre de Lisbonne',
            level: 'A2',
            wordCount: 95,
            content: `En 1755, un tremblement de terre frappe Lisbonne, au Portugal. Les bâtiments tombent, et un grand incendie commence. Ensuite, une énorme vague arrive près de la ville. Beaucoup de personnes meurent et la ville est détruite. Après la catastrophe, les autorités décident de reconstruire Lisbonne avec des règles plus modernes. Cet événement change aussi la façon dont les gens pensent aux catastrophes naturelles.`
        },
        {
            id: 'fr-a2-9',
            title: 'L’ouverture du canal de Suez',
            level: 'A2',
            wordCount: 90,
            content: `Avant, les bateaux qui vont d’Europe en Asie doivent faire un très long voyage autour de l’Afrique. Au 19e siècle, on construit le canal de Suez en Égypte. En 1869, le canal ouvre officiellement. Les bateaux gagnent beaucoup de temps, et le commerce devient plus rapide. Le canal devient très important pour l’économie mondiale. Aujourd’hui encore, beaucoup de navires passent par là.`
        },
        {
            id: 'fr-a2-10',
            title: 'La création de l’Union européenne',
            level: 'A2',
            wordCount: 100,
            content: `Après la Seconde Guerre mondiale, plusieurs pays d’Europe veulent éviter de nouveaux conflits. Ils commencent à coopérer dans l’économie et la politique. Petit à petit, cette coopération devient plus grande. Plus tard, on parle de l’Union européenne. Les pays veulent faciliter le commerce et les voyages. Dans beaucoup d’endroits, les gens peuvent voyager sans contrôle de frontière. L’Union européenne influence aujourd’hui la vie de millions de personnes.`
        },
        {
            id: 'fr-b1-1',
            title: 'La conquête de l’Everest (1953)',
            level: 'B1',
            wordCount: 130,
            content: `Pendant longtemps, l’Everest semblait impossible à atteindre. Le froid extrême, les vents violents et le manque d’oxygène épuisent même les meilleurs alpinistes. En 1953, une grande expédition part au Népal avec beaucoup de matériel et des guides locaux. Deux hommes deviennent les derniers candidats: Edmund Hillary et Tenzing Norgay. Ils avancent lentement, installent des camps, puis attendent une fenêtre météo. Le 29 mai, ils quittent leur tente très tôt, avec des bouteilles d’oxygène. La montée finale est courte mais très dangereuse, car chaque pas demande un effort énorme. Quand ils arrivent au sommet, ils ne restent pas longtemps: il faut redescendre en sécurité. Leur réussite devient un symbole mondial de courage et de coopération.`
        },
        {
            id: 'fr-b1-2',
            title: 'L’indépendance de l’Inde (1947)',
            level: 'B1',
            wordCount: 140,
            content: `Pendant des décennies, l’Inde est sous domination britannique. Beaucoup d’Indiens veulent décider eux-mêmes de leur avenir, mais la situation est complexe: le pays est immense, avec différentes religions et régions. Gandhi devient une figure centrale, car il propose une stratégie de non-violence. Il encourage les boycotts, les marches et la désobéissance civile. Ces actions montrent que la population peut résister sans armes, mais elles créent aussi des tensions. Après la Seconde Guerre mondiale, le Royaume-Uni est affaibli et les négociations accélèrent. En 1947, l’indépendance est annoncée. Pourtant, ce moment historique est aussi douloureux: la partition entre l’Inde et le Pakistan provoque des violences et de grands déplacements de population. L’événement reste un exemple fort de lutte politique, mais aussi un rappel des conséquences possibles d’une séparation.`
        },
        {
            id: 'fr-b1-3',
            title: 'La crise de Cuba (1962)',
            level: 'B1',
            wordCount: 150,
            content: `En 1962, la Guerre froide est déjà très tendue. Les États-Unis découvrent que l’Union soviétique installe des missiles nucléaires à Cuba, une île très proche de la Floride. Pour Washington, c’est inacceptable, car ces missiles pourraient frapper rapidement le territoire américain. Le président Kennedy choisit une réponse prudente mais ferme: une “quarantaine” navale, c’est-à-dire un blocus pour empêcher l’arrivée de nouvelles armes. Pendant plusieurs jours, le monde retient son souffle. Si un navire soviétique force le passage, une guerre peut commencer. En parallèle, les deux camps négocient, parfois en secret. Finalement, un accord est trouvé: l’URSS retire les missiles de Cuba, et les États-Unis promettent de ne pas envahir l’île. La crise montre à quel point une décision, un malentendu ou une erreur peut mettre la planète en danger.`
        },
        {
            id: 'fr-b1-4',
            title: 'Le procès de Nelson Mandela (1964)',
            level: 'B1',
            wordCount: 145,
            content: `En Afrique du Sud, l’apartheid impose une séparation raciale stricte: droits limités, quartiers séparés, discriminations au travail et dans l’éducation. Nelson Mandela s’engage contre ce système et devient une figure importante de la résistance. En 1964, il est jugé lors du procès de Rivonia, avec d’autres militants. Le gouvernement comprend que le procès est aussi une scène publique. Il prononce un discours marquant où il explique son combat pour une société démocratique et égalitaire. Il sait qu’il risque la peine de mort, mais il ne renonce pas à ses idées. Finalement, il est condamné à la prison à vie et passe de longues années derrière les barreaux. Pourtant, son emprisonnement ne fait pas taire le mouvement: au contraire, il devient un symbole international et augmente la pression contre l’apartheid.`
        },
        {
            id: 'fr-b1-5',
            title: 'La mission Apollo 13 (1970)',
            level: 'B1',
            wordCount: 140,
            content: `Apollo 13 devait être une mission “normale” vers la Lune, mais elle devient un drame technologique. Deux jours après le départ, une explosion se produit dans le module de service. Les astronautes entendent un bruit, puis voient des alertes: ils perdent de l’oxygène et de l’électricité. L’atterrissage sur la Lune est immédiatement annulé. Le vrai objectif devient: rentrer vivants. L’équipage utilise le module lunaire comme “bateau de secours”, mais l’espace y est petit et les ressources limitées. Sur Terre, les ingénieurs travaillent sans dormir pour économiser l’énergie, corriger la trajectoire et résoudre le problème du dioxyde de carbone. Chaque décision compte, car une petite erreur peut être fatale. Après plusieurs jours de stress, Apollo 13 revient sur Terre et amerrit. L’histoire est connue pour sa phrase “Houston, we’ve had a problem” et pour la démonstration de sang-froid et d’ingéniosité.`
        },
        {
            id: 'fr-b1-6',
            title: 'La naissance d’Internet et du Web',
            level: 'B1',
            wordCount: 150,
            content: `Au départ, Internet n’est pas créé pour le grand public. Dans les années 1960 et 1970, des chercheurs développent des réseaux capables de continuer à fonctionner même si une partie tombe en panne. L’idée est de partager des informations entre universités et centres de recherche. Petit à petit, des règles communes apparaissent, notamment pour que différents ordinateurs puissent “se comprendre”. Dans les années 1980, le réseau grandit et relie de plus en plus d’institutions. Mais pour la plupart des gens, tout cela reste invisible. Le grand changement arrive au début des années 1990 avec le World Wide Web, qui rend la navigation plus simple grâce aux pages et aux liens. À partir de là, Internet sort des laboratoires, entre dans les foyers, puis dans les téléphones. Aujourd’hui, il influence l’école, le travail, les médias et la politique. Cette histoire montre comment une innovation technique devient un phénomène social mondial.`
        },
        {
            id: 'fr-b1-7',
            title: 'La chute de l’apartheid et l’élection de 1994',
            level: 'B1',
            wordCount: 155,
            content: `Au début des années 1990, l’Afrique du Sud est sous pression. L’apartheid est critiqué dans le pays et à l’étranger, et l’économie souffre. Le gouvernement comprend qu’il ne peut pas continuer comme avant. Nelson Mandela est libéré en 1990 après des décennies de prison, et des négociations commencent avec le président de Klerk. Le processus est fragile: il y a de la violence, de la peur et des groupes opposés au changement. Malgré tout, les discussions avancent vers une nouvelle constitution et des élections ouvertes à tous. En 1994, des millions de Sud-Africains votent pour la première fois sans discrimination raciale. Les files d’attente sont longues, mais l’atmosphère est historique. Mandela est élu président. La fin officielle de l’apartheid ne résout pas tous les problèmes, mais elle marque un tournant majeur: un pays choisit la transition politique plutôt qu’une guerre civile totale, et cela inspire d’autres mouvements dans le monde.`
        },
        {
            id: 'fr-b1-8',
            title: 'Tchernobyl (1986)',
            level: 'B1',
            wordCount: 145,
            content: `En avril 1986, une catastrophe se produit dans la centrale nucléaire de Tchernobyl, en Ukraine (alors dans l’URSS). Un test technique est lancé, mais il est mal préparé et réalisé dans de mauvaises conditions. Plusieurs erreurs humaines se combinent à des faiblesses du réacteur. En quelques minutes, la situation devient incontrôlable: il y a une explosion, puis un incendie, et des substances radioactives sont libérées dans l’atmosphère. Au début, les autorités communiquent peu et tard. La ville voisine, Prypiat, n’est évacuée qu’après un délai, ce qui augmente l’exposition des habitants. Des milliers de travailleurs, souvent appelés “liquidateurs”, interviennent pour limiter les dégâts, parfois avec une protection insuffisante. Les conséquences durent des années: zones interdites, problèmes de santé, peur et débat sur l’énergie nucléaire. Tchernobyl devient un symbole de risque technologique et d’importance de la transparence.`
        },
        {
            id: 'fr-b1-9',
            title: 'La chute de Saigon (1975)',
            level: 'B1',
            wordCount: 150,
            content: `La guerre du Vietnam oppose pendant des années le Nord communiste et le Sud soutenu par les États-Unis. Le conflit est long, violent, et très impopulaire dans plusieurs pays. Après le retrait progressif des troupes américaines, le Sud perd du soutien militaire et politique. En 1975, les forces du Nord avancent rapidement vers Saigon, la capitale du Sud. La situation devient chaotique: beaucoup de civils cherchent à fuir, surtout ceux qui ont travaillé avec le gouvernement sud-vietnamien ou avec les Américains. Les images d’hélicoptères évacuant des personnes depuis les toits font le tour du monde. Quand Saigon tombe, la guerre se termine et le pays est réunifié. Cependant, la fin du conflit ne signifie pas une fin immédiate des souffrances: beaucoup de familles sont séparées, et certains quittent le pays par la mer dans les années suivantes. L’événement reste un symbole de défaite militaire, mais aussi de drame humain.`
        },
        {
            id: 'fr-b1-10',
            title: 'La découverte de la grotte de Lascaux (1940)',
            level: 'B1',
            wordCount: 135,
            content: `En 1940, dans le sud-ouest de la France, des adolescents se promènent près d’une colline. Leur chien disparaît dans un trou, et ils décident d’explorer l’ouverture. À l’intérieur, ils découvrent une grotte avec des peintures étonnantes: des taureaux, des chevaux, des cerfs, dessinés avec une grande précision. Rapidement, des spécialistes confirment que ces œuvres sont très anciennes, datant de la préhistoire. Lascaux devient un trésor culturel, car elle montre que les humains de cette époque avaient déjà un sens artistique développé et des techniques de représentation impressionnantes. Après la guerre, la grotte attire beaucoup de visiteurs. Mais la respiration, la chaleur et la lumière abîment peu à peu les peintures. Pour protéger le site, on ferme la grotte au public et on crée des reproductions. Lascaux rappelle que le patrimoine peut être fragile: il faut le partager, mais aussi le préserver.`
        },
        {
            id: 'fr-b2-1',
            title: 'L’affaire Dreyfus',
            level: 'B2',
            wordCount: 220,
            content: `À la fin du XIXe siècle, la France est une république encore fragile, marquée par des tensions politiques, militaires et religieuses. En 1894, un événement va enflammer le pays: le capitaine Alfred Dreyfus, officier de l’armée, est accusé d’avoir transmis des secrets militaires à l’Allemagne. L’enquête est rapide, opaque, et repose sur des preuves faibles. Pourtant, Dreyfus est condamné pour trahison et envoyé au bagne, sur l’île du Diable, en Guyane. Beaucoup de Français acceptent le verdict, car l’armée est considérée comme intouchable.

Mais des doutes apparaissent. Des enquêteurs découvrent que le véritable coupable pourrait être un autre officier, Esterhazy. Au lieu de corriger l’erreur, une partie de la hiérarchie militaire choisit de protéger son image. L’affaire devient alors politique: d’un côté, ceux qui défendent l’armée et l’ordre; de l’autre, ceux qui demandent la justice et la vérité. En 1898, Émile Zola publie “J’accuse…!”, une lettre ouverte qui accuse l’État et l’armée d’avoir organisé une condamnation injuste. Le texte choque, mobilise, et pousse la société à se positionner.

Après des années de procès, de manipulations et de débats violents, Dreyfus est finalement réhabilité. L’affaire laisse une trace profonde: elle montre comment le nationalisme, les préjugés et la peur peuvent fausser la justice. Elle renforce aussi l’idée que la presse, les intellectuels et l’opinion publique peuvent peser sur le pouvoir, pour le meilleur comme pour le pire.`
        },
        {
            id: 'fr-b2-2',
            title: 'La peste noire',
            level: 'B2',
            wordCount: 230,
            content: `Au milieu du XIVe siècle, l’Europe connaît l’une des pires crises de son histoire: la peste noire. La maladie arrive par les routes commerciales, probablement depuis l’Asie, et se répand rapidement dans les ports puis dans les campagnes. Les symptômes sont terrifiants: fièvre, douleurs, puis des “bubons” (grosses infections) apparaissent. À l’époque, personne ne comprend l’origine exacte du mal. On accuse l’air “empoisonné”, la colère divine, ou des groupes minoritaires, ce qui provoque parfois des violences et des persécutions.

La mortalité est immense: dans certaines régions, une grande partie de la population disparaît en quelques mois. Cette chute brutale du nombre d’habitants bouleverse l’économie. Comme il manque de travailleurs, le travail agricole et artisanal devient plus précieux. Des paysans et des ouvriers exigent de meilleurs salaires et de meilleures conditions. Les autorités tentent souvent de bloquer ces changements, mais la réalité démographique impose un nouvel équilibre.

Même si l’Europe se reconstruit, la peste noire montre que la santé publique et l’organisation sociale sont liées. Elle rappelle aussi une leçon durable: quand une crise frappe, la peur cherche des coupables, et la société peut soit se déchirer, soit apprendre à mieux comprendre et prévenir.`
        },
        {
            id: 'fr-b2-3',
            title: 'Le débarquement de Normandie',
            level: 'B2',
            wordCount: 240,
            content: `Le 6 juin 1944, les Alliés lancent en Normandie l’une des opérations militaires les plus ambitieuses du XXe siècle. Depuis des mois, l’Europe occidentale est occupée par l’Allemagne nazie, et l’ouverture d’un “second front” est considérée comme indispensable pour accélérer la libération. L’enjeu est immense: si l’opération échoue, la guerre pourrait durer beaucoup plus longtemps et coûter encore davantage de vies.

La réussite dépend de plusieurs éléments. D’abord, la préparation logistique: des milliers de bateaux, d’avions, de véhicules et de soldats doivent être coordonnés. Ensuite, la météo: une mer trop agitée ou un ciel trop fermé rendrait le débarquement impossible. Enfin, la stratégie de tromperie: les Alliés font croire que l’attaque aura lieu ailleurs, afin de disperser les forces allemandes.

À l’aube, les troupes débarquent sur plusieurs plages, dont Omaha, Utah, Gold, Juno et Sword. La résistance est très différente selon les zones: certains secteurs sont rapidement sécurisés, tandis que d’autres deviennent des combats extrêmement meurtriers. Malgré les pertes, les Alliés établissent une tête de pont. Dans les semaines suivantes, la bataille de Normandie continue, avec des avancées lentes et des destructions importantes.

Le débarquement n’est pas, à lui seul, la fin de la guerre, mais il change la dynamique: il permet de libérer la France, puis d’avancer vers l’Allemagne. Historiquement, il symbolise aussi la coopération internationale et le prix humain de la libération, car derrière la stratégie, il y a des soldats, des civils, et des villes entières bouleversées.`
        },
        {
            id: 'fr-b2-4',
            title: 'La chute de l’Union soviétique',
            level: 'B2',
            wordCount: 250,
            content: `Pendant des décennies, la Guerre froide organise la politique mondiale autour de deux blocs: l’Ouest, mené par les États-Unis, et l’Est, dominé par l’Union soviétique. Pourtant, dans les années 1980, l’URSS entre dans une période de stagnation économique, avec une industrie peu efficace, des dépenses militaires énormes et une population de plus en plus frustrée. Lorsque Mikhaïl Gorbatchev arrive au pouvoir, il tente des réformes: la perestroïka (restructuration) et la glasnost (plus de transparence). L’objectif est de moderniser le système sans le détruire.

Mais ces réformes ouvrent aussi la porte à des critiques et à des revendications nationales. En Europe de l’Est, les régimes communistes perdent rapidement le contrôle, et les alliances se fragilisent. À l’intérieur même de l’URSS, le pouvoir central est contesté: certains veulent accélérer les changements, d’autres veulent revenir à l’ordre strict.

En 1991, après une tentative de coup d’État et une perte d’autorité du centre, l’Union soviétique se désintègre. Les républiques deviennent des États indépendants, et la Russie reprend une grande partie de l’héritage politique et militaire. La chute de l’URSS n’est pas seulement un événement géopolitique: c’est aussi un choc social. Beaucoup de citoyens voient leur niveau de vie chuter, tandis qu’une nouvelle économie crée rapidement des inégalités. Sur le plan international, elle met fin à un monde “bipolaire”, mais elle ouvre aussi une période d’incertitudes.`
        },
        {
            id: 'fr-b2-5',
            title: 'La découverte de la pénicilline',
            level: 'B2',
            wordCount: 230,
            content: `En 1928, le scientifique Alexander Fleming travaille sur des bactéries dans son laboratoire. À son retour, il remarque qu’une de ses cultures a été contaminée par un champignon. Dans beaucoup de cas, ce type d’accident finit à la poubelle. Fleming, lui, observe un détail: autour du champignon, les bactéries ne poussent plus. Autrement dit, quelque chose bloque leur développement. Il comprend qu’une substance produite par le champignon pourrait tuer certaines bactéries. Il appelle cette substance “pénicilline”.

Cependant, entre une observation et un médicament, il y a un long chemin. La pénicilline est difficile à isoler et à produire, et Fleming n’a pas les moyens techniques de la transformer en traitement utilisable à grande échelle. Ce n’est que plus tard, grâce à d’autres chercheurs et à des avancées industrielles, que la pénicilline peut être purifiée, stabilisée et fabriquée en quantité.

Pendant la Seconde Guerre mondiale, l’enjeu devient crucial: les infections après blessures tuent énormément de soldats. Les antibiotiques changent la situation, car ils permettent de soigner des maladies qui étaient souvent mortelles. Après la guerre, la pénicilline se diffuse dans le monde entier et ouvre l’ère des antibiotiques. Cette histoire illustre plusieurs idées importantes: le rôle du hasard, mais aussi l’importance de l’attention scientifique; la nécessité de collaborations entre recherche et industrie; et enfin, un paradoxe moderne.`
        },
    ],

    // ITALIAN 🇮🇹
    it: [
        {
            id: 'it-a1-1',
            title: 'La Mia Casa',
            level: 'A1',
            wordCount: 78,
            content: `Abito in un appartamento a Roma. La mia casa ha quattro stanze: la cucina, il soggiorno, la camera da letto e il bagno. La cucina è piccola ma comoda. Nel soggiorno c'è un divano e una televisione. La mia camera è la mia preferita. Ho un letto grande e una scrivania. Dalla finestra vedo un parco. Mi piace molto la mia casa perché è luminosa e tranquilla.`
        },
        {
            id: 'it-a2-1',
            title: 'La Volpe e l\'Uva',
            level: 'A2',
            wordCount: 100,
            content: `Una volpe affamata vide dei grappoli d'uva che pendevano da una pergola. L'uva sembrava matura e dolce. La volpe saltò per prenderla, ma non ci riuscì. Saltò ancora e ancora, ma l'uva era troppo in alto. Dopo molti tentativi, la volpe si stancò. Si fermò, guardò l'uva e disse: "Questa uva è sicuramente acerba. Non la voglio." E se ne andò. Questa storia ci insegna che a volte diciamo di non volere qualcosa solo perché non possiamo averla.`,
            source: 'Esopo'
        },
        {
            id: 'it-b1-1',
            title: 'Il Caffè Italiano',
            level: 'B1',
            wordCount: 145,
            content: `In Italia, il caffè non è solo una bevanda, è un rituale sociale. Gli italiani bevono l'espresso al bancone del bar, spesso in piedi, in pochi minuti. È un momento di pausa nella giornata, un'occasione per scambiare due parole con il barista o con altri clienti. Esistono molte varianti: il caffè macchiato, il caffè corretto con un goccio di liquore, il cappuccino che si beve solo al mattino. Ordinare un cappuccino dopo pranzo è considerato strano dagli italiani. Il caffè accompagna ogni momento della giornata: la colazione, la fine del pranzo, il pomeriggio. Per molti stranieri, l'espresso italiano è troppo forte e troppo piccolo. Ma una volta che ci si abitua, è difficile tornare indietro. Il caffè italiano è un'esperienza, non solo una bevanda.`
        },
        {
            id: 'it-b2-1',
            title: 'Il Futuro delle Città',
            level: 'B2',
            wordCount: 165,
            content: `Le città del futuro dovranno affrontare sfide enormi: cambiamenti climatici, sovrappopolazione, inquinamento. Gli urbanisti stanno ripensando completamente il modo in cui concepiamo lo spazio urbano. Le "città in 15 minuti" propongono quartieri dove tutto ciò che serve è raggiungibile a piedi in un quarto d'ora. I tetti verdi e i giardini verticali aiutano a combattere il calore e migliorare la qualità dell'aria. I trasporti pubblici elettrici e le piste ciclabili riducono le emissioni. Tuttavia, queste innovazioni rischiano di creare nuove disuguaglianze. I quartieri sostenibili tendono ad essere più costosi, escludendo le fasce più povere della popolazione. La sfida sarà creare città che siano allo stesso tempo ecologiche, accessibili e inclusive. Non basta costruire edifici verdi; bisogna ripensare la società stessa e il nostro modo di vivere insieme.`
        }
    ],

    // PORTUGUESE 🇵🇹
    pt: [
        {
            id: 'pt-a1-1',
            title: 'Minha Rotina',
            level: 'A1',
            wordCount: 80,
            content: `Meu nome é Pedro. Moro em Lisboa. Acordo às sete da manhã. Tomo café e como pão com queijo. Vou trabalhar de metro. Trabalho num escritório no centro da cidade. Ao meio-dia, almoço num restaurante perto do trabalho. À tarde, tenho reuniões. Saio do trabalho às seis horas. À noite, janto em casa e vejo televisão. Aos fins de semana, gosto de ir à praia.`
        },
        {
            id: 'pt-a2-1',
            title: 'A Lebre e a Tartaruga',
            level: 'A2',
            wordCount: 110,
            content: `Uma lebre muito rápida gostava de zombar de uma tartaruga lenta. Um dia, a tartaruga desafiou a lebre para uma corrida. A lebre aceitou, rindo. Quando a corrida começou, a lebre correu muito à frente. Ela estava tão confiante que decidiu descansar um pouco. Enquanto isso, a tartaruga continuou a andar devagar, mas sem parar. A lebre dormiu mais do que pretendia. Quando acordou, viu a tartaruga a chegar à meta. A tartaruga ganhou a corrida! A moral da história é que devagar e sempre se ganha a corrida.`,
            source: 'Esopo'
        },
        {
            id: 'pt-b1-1',
            title: 'A Saudade Portuguesa',
            level: 'B1',
            wordCount: 140,
            content: `Saudade é uma palavra portuguesa difícil de traduzir. Não é apenas tristeza ou nostalgia. É um sentimento profundo de falta de algo ou alguém. Os portugueses sentem saudade de pessoas queridas que estão longe, de lugares onde foram felizes, de tempos passados. A saudade está presente na música portuguesa, especialmente no fado. Os cantores de fado expressam essa emoção através de melodias melancólicas. Os portugueses levam a saudade consigo quando emigram para outros países. Mas a saudade não é necessariamente negativa. Ela mostra que valorizamos as nossas memórias e relações. Sentir saudade significa que tivemos momentos felizes que vale a pena recordar. É uma prova de que amamos profundamente.`
        },
        {
            id: 'pt-b2-1',
            title: 'O Impacto das Redes Sociais',
            level: 'B2',
            wordCount: 165,
            content: `As redes sociais transformaram a forma como nos relacionamos com o mundo. Por um lado, permitem-nos manter contacto com pessoas distantes e aceder a informação em tempo real. Por outro lado, levantam questões sérias sobre privacidade, saúde mental e desinformação. Estudos mostram que o uso excessivo de redes sociais está associado a maiores níveis de ansiedade e depressão, especialmente entre os jovens. A comparação constante com vidas aparentemente perfeitas pode prejudicar a autoestima. Além disso, os algoritmos criam bolhas de informação que reforçam as nossas crenças e limitam a exposição a perspetivas diferentes. No entanto, proibir ou demonizar as redes sociais não parece ser a solução. O desafio está em desenvolver uma literacia digital que nos permita usar estas ferramentas de forma consciente e equilibrada. Precisamos de aprender a questionar o que vemos e a proteger o nosso bem-estar.`
        }
    ],

    // JAPANESE 🇯🇵
    ja: [
        {
            id: 'ja-a1-1',
            title: '私の一日',
            level: 'A1',
            wordCount: 60,
            content: `私は田中です。毎朝七時に起きます。朝ごはんにパンとコーヒーを食べます。八時に電車で会社に行きます。会社で働きます。お昼に食堂でごはんを食べます。六時に家に帰ります。晩ごはんを作ります。テレビを見ます。十一時に寝ます。`
        },
        {
            id: 'ja-a2-1',
            title: 'うさぎとかめ',
            level: 'A2',
            wordCount: 85,
            content: `昔々、うさぎとかめがいました。うさぎは足が速くて、かめは遅かったです。ある日、二人は競争をしました。うさぎはすぐに先に行きました。うさぎは「かめは遅いから、少し寝よう」と思いました。うさぎが寝ている間に、かめは休まずに歩き続けました。うさぎが起きた時、かめはもうゴールにいました。かめが勝ちました。ゆっくりでも、諦めないことが大切です。`,
            source: 'イソップ'
        },
        {
            id: 'ja-b1-1',
            title: '日本の四季',
            level: 'B1',
            wordCount: 120,
            content: `日本には四つの季節があります。春は三月から五月までです。桜が咲いて、多くの人がお花見をします。夏は六月から八月までで、とても暑いです。海やプールに行く人が多いです。秋は九月から十一月までです。紅葉が美しくて、涼しくなります。冬は十二月から二月までで、雪が降る地域もあります。日本人は季節の変化を大切にしています。食べ物や行事も季節によって変わります。例えば、春は桜餅、夏はかき氷、秋は栗ご飯、冬はお鍋を楽しみます。`
        },
        {
            id: 'ja-b2-1',
            title: '働き方の変化',
            level: 'B2',
            wordCount: 140,
            content: `日本の働き方は大きく変わっています。以前は、一つの会社で定年まで働くのが普通でした。長時間労働も当たり前でした。しかし、最近は状況が違います。若い世代は、ワークライフバランスを重視しています。転職も珍しくなくなりました。リモートワークも広がり、働く場所の自由度が増しています。一方で、新しい課題も生まれています。コミュニケーション不足や孤独感を感じる人もいます。また、成果で評価される傾向が強くなり、プレッシャーを感じる人も少なくありません。社会全体で、新しい働き方を模索している段階にあります。`
        }
    ],

    // KOREAN 🇰🇷
    ko: [
        {
            id: 'ko-a1-1',
            title: '자기소개',
            level: 'A1',
            wordCount: 55,
            content: `안녕하세요. 저는 김민수입니다. 저는 서울에 살아요. 저는 학생이에요. 아침에 학교에 가요. 점심에 친구와 밥을 먹어요. 오후에 공부해요. 저녁에 집에 와요. 취미는 게임이에요. 주말에는 친구를 만나요. 감사합니다.`
        },
        {
            id: 'ko-a2-1',
            title: '토끼와 거북이',
            level: 'A2',
            wordCount: 90,
            content: `옛날에 토끼와 거북이가 있었어요. 토끼는 빨랐고 거북이는 느렸어요. 어느 날, 둘이 경주를 했어요. 토끼가 먼저 앞으로 갔어요. 토끼는 "거북이는 느리니까 잠을 자도 되겠다"고 생각했어요. 그래서 토끼는 나무 아래에서 잠을 잤어요. 거북이는 쉬지 않고 계속 걸었어요. 토끼가 일어났을 때, 거북이는 이미 결승선에 있었어요. 거북이가 이겼어요. 포기하지 않는 것이 중요해요.`,
            source: '이솝'
        },
        {
            id: 'ko-b1-1',
            title: '한국의 명절',
            level: 'B1',
            wordCount: 115,
            content: `한국에는 중요한 명절이 많습니다. 가장 큰 명절은 설날과 추석입니다. 설날은 음력 1월 1일이에요. 가족들이 모여서 떡국을 먹고 세배를 합니다. 어른들은 아이들에게 세뱃돈을 줍니다. 추석은 음력 8월 15일이에요. 추석에는 송편을 만들어 먹습니다. 조상에게 감사하는 마음으로 차례를 지냅니다. 이 명절에는 많은 사람들이 고향에 갑니다. 그래서 고속도로가 매우 막힙니다. 명절은 가족과 함께 시간을 보내는 소중한 기회입니다.`
        },
        {
            id: 'ko-b2-1',
            title: '한류의 세계적 영향',
            level: 'B2',
            wordCount: 135,
            content: `한국 문화는 전 세계적으로 큰 인기를 얻고 있습니다. K-pop 아이돌 그룹은 수백만 명의 팬을 가지고 있습니다. 한국 드라마와 영화도 국제적으로 성공하고 있습니다. 이러한 현상을 '한류'라고 부릅니다. 한류의 성공 요인은 무엇일까요? 높은 품질의 콘텐츠, 소셜 미디어의 활용, 그리고 팬들과의 적극적인 소통이 중요한 역할을 합니다. 한류는 한국 경제에도 큰 도움이 됩니다. 관광객이 늘어나고, 한국 제품에 대한 관심도 높아집니다. 그러나 문화 다양성의 관점에서 글로벌화의 부정적인 면도 고려해야 합니다.`
        }
    ],

    // CHINESE 🇨🇳
    zh: [
        {
            id: 'zh-a1-1',
            title: '我的家',
            level: 'A1',
            wordCount: 50,
            content: `我叫小明。我住在北京。我的家有三个人：爸爸、妈妈和我。爸爸是医生，妈妈是老师。我是学生。我们有一只猫，叫小白。我们的房子不大，但是很温暖。我爱我的家。`
        },
        {
            id: 'zh-a2-1',
            title: '龟兔赛跑',
            level: 'A2',
            wordCount: 85,
            content: `从前，有一只兔子和一只乌龟。兔子跑得很快，乌龟走得很慢。有一天，他们决定比赛。比赛开始了，兔子很快跑到了前面。兔子想："乌龟太慢了，我可以休息一下。"于是兔子在树下睡着了。乌龟没有休息，一直慢慢地走。最后，乌龟先到了终点。乌龟赢了比赛。这个故事告诉我们，坚持比速度更重要。`,
            source: '伊索寓言'
        },
        {
            id: 'zh-b1-1',
            title: '中国的饮食文化',
            level: 'B1',
            wordCount: 110,
            content: `中国的饮食文化历史悠久，非常丰富。中国有八大菜系，每个地区都有自己的特色菜。北方人喜欢吃面食，南方人喜欢吃米饭。在中国，吃饭不仅是为了填饱肚子，也是社交的重要方式。朋友聚会、商务会议常常在餐桌上进行。中国人吃饭用筷子，这与西方用刀叉不同。另外，中国人喜欢点很多菜，大家一起分享。如果盘子空了，主人会觉得没有照顾好客人。近年来，年轻人的饮食习惯正在改变，外卖和快餐越来越流行。`
        },
        {
            id: 'zh-b2-1',
            title: '城市化的挑战',
            level: 'B2',
            wordCount: 130,
            content: `中国的城市化进程非常迅速。过去几十年，数亿人从农村搬到了城市。城市化带来了经济发展和生活水平的提高，但也产生了很多问题。首先，大城市的房价太高，很多年轻人买不起房子。其次，交通拥堵和空气污染影响了人们的生活质量。另外，农村的年轻人都去了城市，留下了老人和孩子，这被称为"留守问题"。为了解决这些问题，政府正在发展中小城市，推动产业转移，希望实现更均衡的发展。城市化是不可避免的趋势，关键是如何让它更加可持续、更加人性化。`
        }
    ],

    // RUSSIAN 🇷🇺
    ru: [
        {
            id: 'ru-a1-1',
            title: 'Моя Семья',
            level: 'A1',
            wordCount: 70,
            content: `Меня зовут Анна. Я живу в Москве. У меня большая семья. Мой папа работает инженером. Моя мама — учительница. У меня есть брат и сестра. Брата зовут Иван, ему двадцать лет. Сестру зовут Мария, ей пятнадцать лет. Мы живём в квартире. По выходным мы вместе гуляем в парке. Я люблю свою семью.`
        },
        {
            id: 'ru-a2-1',
            title: 'Лиса и Виноград',
            level: 'A2',
            wordCount: 95,
            content: `Однажды голодная лиса шла по лесу. Она увидела виноград, который висел высоко на лозе. Виноград выглядел спелым и сладким. Лиса прыгнула, но не смогла достать его. Она прыгала снова и снова, но виноград висел слишком высоко. Наконец, лиса устала. Она посмотрела на виноград и сказала: "Этот виноград наверняка кислый. Он мне не нужен." И лиса ушла. Эта история учит нас, что иногда мы говорим, что не хотим чего-то, когда не можем это получить.`,
            source: 'Эзоп'
        },
        {
            id: 'ru-b1-1',
            title: 'Русская Зима',
            level: 'B1',
            wordCount: 130,
            content: `Русская зима известна во всём мире своими морозами. В некоторых регионах температура опускается до минус сорока градусов. Однако русские люди привыкли к холоду. Они носят тёплую одежду: шубы, шапки, валенки. Зимой популярны зимние виды спорта: катание на лыжах, коньках, санках. Дети любят играть в снежки и лепить снеговиков. Зима в России длится долго, обычно с ноября по март. Это время праздников: Новый год и Рождество. Семьи собираются вместе, готовят традиционные блюда, дарят подарки. Несмотря на холод, зима — это магическое время года. Снег покрывает всё белым покрывалом, и города становятся сказочно красивыми.`
        },
        {
            id: 'ru-b2-1',
            title: 'Цифровая Грамотность',
            level: 'B2',
            wordCount: 155,
            content: `В современном мире цифровая грамотность стала необходимым навыком. Это не только умение пользоваться компьютером или смартфоном. Цифровая грамотность включает критическое мышление при потреблении онлайн-информации, защиту личных данных и понимание того, как работают алгоритмы социальных сетей. К сожалению, многие люди, особенно старшее поколение, не обладают этими навыками. Они могут стать жертвами мошенников или распространять ложную информацию, не осознавая этого. С другой стороны, молодёжь часто воспринимает технологии как нечто само собой разумеющееся и не задумывается о рисках. Образовательные программы должны включать обучение цифровой грамотности для всех возрастных групп. В эпоху, когда информация — это власть, умение работать с ней становится ключевым фактором успеха.`
        }
    ],

    // DUTCH 🇳🇱
    nl: [
        {
            id: 'nl-a1-1',
            title: 'Mijn Dag',
            level: 'A1',
            wordCount: 75,
            content: `Ik heet Jan. Ik woon in Amsterdam. Elke ochtend sta ik om zeven uur op. Ik ontbijt met brood en kaas. Ik drink koffie. Om acht uur ga ik naar mijn werk. Ik werk op een kantoor. Om twaalf uur eet ik lunch. Na het werk ga ik naar huis. Ik kook het avondeten. Daarna kijk ik televisie. Om elf uur ga ik slapen.`
        },
        {
            id: 'nl-a2-1',
            title: 'De Vos en de Druiven',
            level: 'A2',
            wordCount: 100,
            content: `Op een warme dag liep een hongerige vos door het bos. Hij zag druiven hangen aan een wijnstok. De druiven zagen er lekker en rijp uit. De vos sprong omhoog om de druiven te pakken, maar hij kon ze niet bereiken. Hij probeerde het keer op keer, maar de druiven hingen te hoog. Ten slotte gaf de vos op. "Die druiven zijn vast zuur," zei hij. "Ik wil ze toch niet." En hij liep weg. Dit verhaal leert ons dat we soms zeggen dat we iets niet willen, alleen omdat we het niet kunnen krijgen.`,
            source: 'Aesopus'
        },
        {
            id: 'nl-b1-1',
            title: 'Fietsen in Nederland',
            level: 'B1',
            wordCount: 140,
            content: `Nederland staat bekend om zijn fietscultuur. Er zijn meer fietsen dan inwoners in het land. Bijna iedereen fietst: naar school, naar werk, naar de winkels. De infrastructuur is perfect voor fietsers. Er zijn aparte fietspaden, verkeerslichten voor fietsers en grote fietsenstallingen bij stations. Het vlakke landschap maakt fietsen gemakkelijk. Fietsen is niet alleen praktisch, maar ook gezond en goed voor het milieu. Toeristen huren vaak een fiets om de steden te verkennen. Maar fietsen in Nederland kan ook gevaarlijk zijn voor nieuwelingen. Er zijn veel regels en Nederlandse fietsers rijden snel. Een typisch Nederlands beeld is een ouder die kinderen vervoert op een bakfiets. De fiets is meer dan vervoer; het is een onderdeel van de Nederlandse identiteit.`
        },
        {
            id: 'nl-b2-1',
            title: 'De Toekomst van Werk',
            level: 'B2',
            wordCount: 160,
            content: `De arbeidsmarkt verandert snel door technologie en globalisering. Banen die twintig jaar geleden niet bestonden, zijn nu essentieel. Tegelijkertijd verdwijnen traditionele beroepen door automatisering. Hoe kunnen we ons hierop voorbereiden? Levenslang leren wordt steeds belangrijker. Werknemers moeten bereid zijn om regelmatig nieuwe vaardigheden te leren. Flexibiliteit en aanpassingsvermogen zijn cruciaal geworden. Naast technische kennis worden soft skills zoals creativiteit, kritisch denken en communicatie steeds belangrijker. Machines kunnen veel taken overnemen, maar menselijke creativiteit blijft onvervangbaar. De opkomst van de gig economy biedt kansen maar ook onzekerheid. Niet iedereen geniet van de vrijheid van freelance werk; velen missen de stabiliteit van een vast contract. De uitdaging voor beleidsmakers is om een balans te vinden tussen flexibiliteit en zekerheid. De toekomst van werk is onzeker, maar wie zich aanpast, heeft de beste kansen.`
        }
    ]
};

// Helper function to get content for a specific language
export const getContentForLanguage = (languageCode: string): GradedPassage[] => {
    return GRADED_CONTENT[languageCode] || [];
};

// Helper function to filter content by level
export const filterByLevel = (passages: GradedPassage[], level: 'A1' | 'A2' | 'B1' | 'B2' | 'all'): GradedPassage[] => {
    if (level === 'all') return passages;
    return passages.filter(p => p.level === level);
};
