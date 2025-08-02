// I need 200 unique Classical Liberal and Conservative quotes.

const quotes = [
  {
    title: 'Government is not reason; it is not eloquent',
    quote:
      'Government is not reason; it is not eloquent; it is force. Like fire, it is a dangerous servant and a fearful master.',
    author: 'George Washington',
  },
  {
    title: 'The nine most terrifying words',
    quote:
      "The nine most terrifying words in the English language are: I'm from the government and I'm here to help.",
    author: 'Ronald Reagan',
  },
  {
    title: 'A society that puts equality before freedom',
    quote:
      'A society that puts equality before freedom will get neither. A society that puts freedom before equality will get a high degree of both.',
    author: 'Milton Friedman',
  },
  {
    title: 'The power to tax involves the power to destroy',
    quote: 'The power to tax involves the power to destroy.',
    author: 'John Marshall',
  },
  {
    title: 'Concentrated power is not rendered harmless',
    quote:
      'Concentrated power is not rendered harmless by the good intentions of those who create it.',
    author: 'Milton Friedman',
  },
  {
    title: 'The Constitution is not an instrument for the government',
    quote:
      'The Constitution is not an instrument for the government to restrain the people, it is an instrument for the people to restrain the government.',
    author: 'Patrick Henry',
  },
  {
    title: 'Liberty means responsibility',
    quote: 'Liberty means responsibility. That is why most men dread it.',
    author: 'George Bernard Shaw',
  },
  {
    title: 'Nine most terrifying words',
    quote:
      "The nine most terrifying words in the English language are: I'm from the government and I'm here to help.",
    author: 'Ronald Reagan',
  },
  {
    title: 'Equality before freedom',
    quote:
      'A society that puts equality before freedom will get neither. A society that puts freedom before equality will get a high degree of both.',
    author: 'Milton Friedman',
  },
  {
    title: 'Power to tax is power to destroy',
    quote: 'The power to tax involves the power to destroy.',
    author: 'John Marshall',
  },
  {
    title: 'Concentrated power not harmless',
    quote:
      'Concentrated power is not rendered harmless by the good intentions of those who create it.',
    author: 'Milton Friedman',
  },
  {
    title: 'Constitution restrains government',
    quote:
      'The Constitution is not an instrument for the government to restrain the people, it is an instrument for the people to restrain the government.',
    author: 'Patrick Henry',
  },
  {
    title: 'Liberty means responsibility',
    quote: 'Liberty means responsibility. That is why most men dread it.',
    author: 'George Bernard Shaw',
  },
  {
    title: 'Freedom is never more than one generation',
    quote: 'Freedom is never more than one generation away from extinction.',
    author: 'Ronald Reagan',
  },
  {
    title: 'The smallest minority on earth',
    quote:
      'The smallest minority on earth is the individual. Those who deny individual rights cannot claim to be defenders of minorities.',
    author: 'Ayn Rand',
  },
  {
    title: 'The welfare state is not really about the welfare of the masses',
    quote:
      'The welfare state is not really about the welfare of the masses. It is about the egos of the elites.',
    author: 'Thomas Sowell',
  },
  {
    title: 'You cannot multiply wealth',
    quote: 'You cannot multiply wealth by dividing it.',
    author: 'Adrian Rogers',
  },
  {
    title: 'Inflation is taxation without legislation',
    quote: 'Inflation is taxation without legislation.',
    author: 'Milton Friedman',
  },
  {
    title: 'Democracy must be something more',
    quote:
      'Democracy must be something more than two wolves and a sheep voting on what to have for dinner.',
    author: 'James Bovard',
  },
  {
    title: 'No government ever voluntarily reduces itself',
    quote:
      'No government ever voluntarily reduces itself in size. Government programs, once launched, never disappear.',
    author: 'Ronald Reagan',
  },
  {
    title: 'The more the state plans',
    quote:
      'The more the state plans, the more difficult planning becomes for the individual.',
    author: 'Friedrich Hayek',
  },
  {
    title: 'A government that robs Peter',
    quote:
      'A government that robs Peter to pay Paul can always depend on the support of Paul.',
    author: 'George Bernard Shaw',
  },
  {
    title: 'The curious task of economics',
    quote:
      'The curious task of economics is to demonstrate to men how little they really know about what they imagine they can design.',
    author: 'Friedrich Hayek',
  },
  {
    title: 'Man is not free unless government is limited',
    quote: 'Man is not free unless government is limited.',
    author: 'Ronald Reagan',
  },
  {
    title: 'There is all the difference in the world',
    quote:
      'There is all the difference in the world between treating people equally and attempting to make them equal.',
    author: 'Friedrich Hayek',
  },
  {
    title: 'It is hard to imagine a more stupid',
    quote:
      'It is hard to imagine a more stupid or more dangerous way of making decisions than by putting those decisions in the hands of people who pay no price for being wrong.',
    author: 'Thomas Sowell',
  },
  {
    title: 'Nothing is so permanent',
    quote: 'Nothing is so permanent as a temporary government program.',
    author: 'Milton Friedman',
  },
  {
    title: 'Those who expect to reap the blessings of freedom',
    quote:
      'Those who expect to reap the blessings of freedom must, like men, undergo the fatigue of supporting it.',
    author: 'Thomas Paine',
  },
  {
    title: 'The man who reads nothing',
    quote:
      'The man who reads nothing at all is better educated than the man who reads nothing but newspapers.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'The problem with socialism',
    quote:
      "The problem with socialism is that you eventually run out of other people's money.",
    author: 'Margaret Thatcher',
  },
  {
    title: 'Of all tyrannies',
    quote:
      'Of all tyrannies, a tyranny sincerely exercised for the good of its victims may be the most oppressive.',
    author: 'C.S. Lewis',
  },
  {
    title: 'The great danger to liberty',
    quote:
      'The great danger to liberty is that the state will come to regard all liberty as a threat to itself.',
    author: 'Thomas Sowell',
  },
  {
    title: 'When the people fear the government',
    quote:
      'When the people fear the government, there is tyranny. When the government fears the people, there is liberty.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'The essence of freedom',
    quote: 'The essence of freedom is the proper limitation of government.',
    author: 'Founding Fathers',
  },
  {
    title: 'The more corrupt the state',
    quote: 'The more corrupt the state, the more numerous the laws.',
    author: 'Tacitus',
  },
  {
    title: 'If you put the federal government in charge of the Sahara Desert',
    quote:
      "If you put the federal government in charge of the Sahara Desert, in five years there'd be a shortage of sand.",
    author: 'Milton Friedman',
  },
  {
    title: "No man's life, liberty, or property",
    quote:
      "No man's life, liberty, or property are safe while the legislature is in session.",
    author: 'Mark Twain',
  },
  {
    title: 'The state is that great fiction',
    quote:
      'The state is that great fiction by which everyone tries to live at the expense of everyone else.',
    author: 'Fr\u00e9d\u00e9ric Bastiat',
  },
  {
    title: 'Political correctness is tyranny',
    quote: 'Political correctness is tyranny with manners.',
    author: 'Charlton Heston',
  },
  {
    title: 'The inherent vice of capitalism',
    quote:
      'The inherent vice of capitalism is the unequal sharing of blessings; the inherent virtue of socialism is the equal sharing of miseries.',
    author: 'Winston Churchill',
  },
  {
    title: 'The real division is not between conservatives and revolutionaries',
    quote:
      'The real division is not between conservatives and revolutionaries but between authoritarians and libertarians.',
    author: 'George Orwell',
  },
  {
    title: "Those who cry out that the government should 'do something'",
    quote:
      "Those who cry out that the government should 'do something' never even ask what the government is qualified to do.",
    author: 'Thomas Sowell',
  },
  {
    title: "The problem isn't that Johnny can't read",
    quote:
      "The problem isn't that Johnny can't read. The problem isn't even that Johnny can't think. The problem is that Johnny doesn't know what thinking is.",
    author: 'Richard Mitchell',
  },
  {
    title: 'There is no such thing as a free lunch',
    quote: 'There is no such thing as a free lunch.',
    author: 'Milton Friedman',
  },
  {
    title: 'In politics, stupidity is not a handicap',
    quote: 'In politics, stupidity is not a handicap.',
    author: 'Napoleon Bonaparte',
  },
  {
    title: 'Never let a crisis go to waste',
    quote:
      'Never let a crisis go to waste. They are opportunities to do big things.',
    author: 'Rahm Emanuel',
  },
  {
    title: 'The urge to save humanity',
    quote:
      'The urge to save humanity is almost always a false front for the urge to rule.',
    author: 'H.L. Mencken',
  },
  {
    title: 'Truth is treason in the empire of lies',
    quote: 'Truth is treason in the empire of lies.',
    author: 'Ron Paul',
  },
  {
    title: 'If liberty means anything at all',
    quote:
      'If liberty means anything at all, it means the right to tell people what they do not want to hear.',
    author: 'George Orwell',
  },
  {
    title: 'What is prudence in the conduct of every private family',
    quote:
      'What is prudence in the conduct of every private family can scarce be folly in that of a great kingdom.',
    author: 'Adam Smith',
  },
  {
    title: 'The Constitution only gives people the right to pursue happiness',
    quote:
      'The Constitution only gives people the right to pursue happiness. You have to catch it yourself.',
    author: 'Benjamin Franklin',
  },
  {
    title: 'Giving money and power to government',
    quote:
      'Giving money and power to government is like giving whiskey and car keys to teenage boys.',
    author: "P.J. O'Rourke",
  },
  {
    title: 'A man is no less a slave',
    quote:
      'A man is no less a slave because he is allowed to choose a new master once in a term of years.',
    author: 'Lysander Spooner',
  },
  {
    title: 'If you have ten thousand regulations',
    quote:
      'If you have ten thousand regulations, you destroy all respect for the law.',
    author: 'Winston Churchill',
  },
  {
    title: 'The only thing that saves us from bureaucracy',
    quote:
      'The only thing that saves us from the bureaucracy is inefficiency. An efficient bureaucracy is the greatest threat to liberty.',
    author: 'Eugene McCarthy',
  },
  {
    title: 'People who are willing to trade freedom for security',
    quote:
      'People who are willing to trade freedom for security will end up with neither.',
    author: 'Benjamin Franklin',
  },
  {
    title: 'To compel a man to furnish contributions',
    quote:
      'To compel a man to furnish contributions of money for the propagation of opinions which he disbelieves and abhors is sinful and tyrannical.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'Liberty is not a means to a higher political end',
    quote:
      'Liberty is not a means to a higher political end. It is itself the highest political end.',
    author: 'Lord Acton',
  },
  {
    title: 'The danger is not that a particular class is unfit to govern',
    quote:
      'The danger is not that a particular class is unfit to govern. Every class is unfit to govern.',
    author: 'Lord Acton',
  },
  {
    title: 'The issue is always the same',
    quote:
      'The issue is always the same: the individual versus the collective.',
    author: 'Ayn Rand',
  },
  {
    title: 'You can’t be for big government',
    quote:
      'You can’t be for big government, big taxes, and big bureaucracy and still be for the little guy.',
    author: 'Ronald Reagan',
  },
  {
    title: 'It is seldom that liberty of any kind is lost all at once',
    quote: 'It is seldom that liberty of any kind is lost all at once.',
    author: 'David Hume',
  },
  {
    title: 'A government big enough to give you everything you want',
    quote:
      'A government big enough to give you everything you want is a government big enough to take from you everything you have.',
    author: 'Gerald Ford',
  },
  {
    title: 'The liberties of a people never were',
    quote:
      'The liberties of a people never were, nor ever will be, secure when the transactions of their rulers may be concealed from them.',
    author: 'Patrick Henry',
  },
  {
    title: 'Every step we take towards making the State our Caretaker',
    quote:
      'Every step we take towards making the State our Caretaker of our lives, by that much we move toward making the State our Master.',
    author: 'Dwight D. Eisenhower',
  },
  {
    title: 'The state is the great fictitious entity',
    quote:
      'The state is the great fictitious entity by which everyone seeks to live at the expense of everyone else.',
    author: 'Frédéric Bastiat',
  },
  {
    title: 'Government’s first duty is to protect the people',
    quote:
      'Government’s first duty is to protect the people, not run their lives.',
    author: 'Ronald Reagan',
  },
  {
    title: 'Civilization is the process of setting man free',
    quote: 'Civilization is the process of setting man free from men.',
    author: 'Ayn Rand',
  },
  {
    title: 'The natural progress of things is for liberty to yield',
    quote:
      'The natural progress of things is for liberty to yield and government to gain ground.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'That government is best which governs least',
    quote: 'That government is best which governs least.',
    author: 'Henry David Thoreau',
  },
  {
    title: 'Experience should teach us to be most on our guard',
    quote:
      "Experience should teach us to be most on our guard to protect liberty when the government's purposes are beneficent.",
    author: 'Louis Brandeis',
  },
  {
    title: 'The bigger the government, the smaller the citizen',
    quote: 'The bigger the government, the smaller the citizen.',
    author: 'Dennis Prager',
  },
  {
    title: 'A liberal is someone who feels a great debt',
    quote:
      'A liberal is someone who feels a great debt to his fellow man, which debt he proposes to pay off with your money.',
    author: 'G. Gordon Liddy',
  },
  {
    title: 'Nothing is more permanent than a temporary government measure',
    quote: 'Nothing is more permanent than a temporary government measure.',
    author: 'Milton Friedman',
  },
  {
    title: 'The welfare state is the oldest con game',
    quote:
      'The welfare state is the oldest con game in the world. First you take people’s money away quietly and then you give some of it back to them flamboyantly.',
    author: 'Thomas Sowell',
  },
  {
    title: 'Government cannot make man richer',
    quote: 'Government cannot make man richer, but it can make him poorer.',
    author: 'Ludwig von Mises',
  },
  {
    title: 'An unlimited power to tax',
    quote:
      'An unlimited power to tax involves, necessarily, a power to destroy.',
    author: 'Daniel Webster',
  },
  {
    title: 'Of all the enemies to public liberty',
    quote:
      'Of all the enemies to public liberty, war is, perhaps, the most to be dreaded.',
    author: 'James Madison',
  },
  {
    title: 'Tyranny is defined as that which is legal for the government',
    quote:
      'Tyranny is defined as that which is legal for the government but illegal for the citizenry.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'Liberty is always dangerous',
    quote: 'Liberty is always dangerous, but it is the safest thing we have.',
    author: 'Harry Emerson Fosdick',
  },
  {
    title: 'The price of freedom is eternal vigilance',
    quote: 'The price of freedom is eternal vigilance.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'A free people ought not only to be armed',
    quote: 'A free people ought not only to be armed, but disciplined.',
    author: 'George Washington',
  },
  {
    title: 'The Constitution is not a living organism',
    quote:
      "The Constitution is not a living organism. It's a legal document, and it says what it says and doesn't say what it doesn't say.",
    author: 'Antonin Scalia',
  },
  {
    title: "Government's view of the economy",
    quote:
      "Government's view of the economy could be summed up in a few short phrases: If it moves, tax it. If it keeps moving, regulate it. And if it stops moving, subsidize it.",
    author: 'Ronald Reagan',
  },
  {
    title: 'No government ever voluntarily reduces itself',
    quote: 'No government ever voluntarily reduces itself in size.',
    author: 'Ronald Reagan',
  },
  {
    title: 'The natural liberty of man',
    quote:
      'The natural liberty of man is to be free from any superior power on Earth.',
    author: 'Samuel Adams',
  },
  {
    title: 'We are a nation that has a government',
    quote: 'We are a nation that has a government - not the other way around.',
    author: 'Ronald Reagan',
  },
  {
    title: 'History teaches that war begins',
    quote:
      'History teaches that war begins when governments believe the price of aggression is cheap.',
    author: 'Ronald Reagan',
  },
  {
    title: 'You can’t legislate morality',
    quote: 'You can’t legislate morality. You can only regulate behavior.',
    author: 'Clarence Thomas',
  },
  {
    title: 'Government has no other end',
    quote: 'Government has no other end, but the preservation of property.',
    author: 'John Locke',
  },
  {
    title: 'To live under the American Constitution',
    quote:
      'To live under the American Constitution is the greatest political privilege that was ever accorded to the human race.',
    author: 'Calvin Coolidge',
  },
  {
    title: 'The legitimate powers of government extend',
    quote:
      'The legitimate powers of government extend to such acts only as are injurious to others.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'If men were angels',
    quote: 'If men were angels, no government would be necessary.',
    author: 'James Madison',
  },
  {
    title: 'The power under the Constitution will always be in the people',
    quote: 'The power under the Constitution will always be in the people.',
    author: 'George Washington',
  },
  {
    title: 'A wise and frugal government',
    quote:
      'A wise and frugal government shall restrain men from injuring one another, shall leave them otherwise free to regulate their own pursuits of industry and improvement.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'The smallest minority on earth is the individual',
    quote:
      'The smallest minority on earth is the individual. Those who deny individual rights cannot claim to be defenders of minorities.',
    author: 'Ayn Rand',
  },
  {
    title: 'When buying and selling are controlled by legislation',
    quote:
      'When buying and selling are controlled by legislation, the first things to be bought and sold are legislators.',
    author: "P.J. O'Rourke",
  },
  {
    title: 'The evils of tyranny are rarely seen',
    quote: 'The evils of tyranny are rarely seen but by him who resists it.',
    author: 'John Hay',
  },
  {
    title: 'The welfare of humanity is always the alibi of tyrants',
    quote: 'The welfare of humanity is always the alibi of tyrants.',
    author: 'Albert Camus',
  },
  {
    title: 'The Constitution is not neutral',
    quote:
      'The Constitution is not neutral. It was designed to take the government off the backs of people.',
    author: 'William O. Douglas',
  },
  {
    title: 'The future doesn’t belong to the fainthearted',
    quote:
      'The future doesn’t belong to the fainthearted; it belongs to the brave.',
    author: 'Ronald Reagan',
  },
  {
    title: 'The trouble with socialism',
    quote:
      'The trouble with socialism is that it always ends up running out of other people’s money.',
    author: 'Margaret Thatcher',
  },
  {
    title: 'Freedom is the right to tell people what they do not want to hear',
    quote: 'Freedom is the right to tell people what they do not want to hear.',
    author: 'George Orwell',
  },
  {
    title: 'To be controlled in our economic pursuits',
    quote:
      'To be controlled in our economic pursuits means to be controlled in everything.',
    author: 'Friedrich Hayek',
  },
  {
    title: 'The state is not equipped to run businesses',
    quote:
      'The state is not equipped to run businesses. It is equipped to run the law.',
    author: 'Margaret Thatcher',
  },
  {
    title: 'All that is necessary for evil to triumph',
    quote:
      'All that is necessary for evil to triumph is for good men to do nothing.',
    author: 'Edmund Burke',
  },
  {
    title: 'The people are the only sure reliance',
    quote:
      'The people are the only sure reliance for the preservation of our liberty.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'The liberty of the individual must be thus far limited',
    quote:
      'The liberty of the individual must be thus far limited; he must not make himself a nuisance to other people.',
    author: 'John Stuart Mill',
  },
  {
    title: 'All men having power ought to be distrusted',
    quote: 'All men having power ought to be distrusted to a certain degree.',
    author: 'James Madison',
  },
  {
    title: 'Power tends to corrupt',
    quote: 'Power tends to corrupt, and absolute power corrupts absolutely.',
    author: 'Lord Acton',
  },
  {
    title: 'It is not wisdom but Authority that makes a law',
    quote: 'It is not wisdom but Authority that makes a law.',
    author: 'Thomas Hobbes',
  },
  {
    title: 'The bigger the government, the more it can give you',
    quote:
      'The bigger the government, the more it can give you everything you want — and take away everything you have.',
    author: 'Anonymous Conservative Axiom',
  },
  {
    title: 'Injustice anywhere is a threat to justice everywhere',
    quote: 'Injustice anywhere is a threat to justice everywhere.',
    author: 'Martin Luther King Jr.',
  },
  {
    title: 'The will of the people is not always the law',
    quote:
      'The will of the people is not always the law. The law should protect the rights of the individual, even against the majority.',
    author: 'Barry Goldwater',
  },
  {
    title: 'Liberty is not collective, it is personal',
    quote:
      'Liberty is not collective, it is personal. All liberty is individual liberty.',
    author: 'Calvin Coolidge',
  },
  {
    title: "A man's admiration for absolute government",
    quote:
      "A man's admiration for absolute government is proportionate to the contempt he feels for those around him.",
    author: 'Alexis de Tocqueville',
  },
  {
    title: 'There are no solutions, only trade-offs',
    quote: 'There are no solutions, only trade-offs.',
    author: 'Thomas Sowell',
  },
  {
    title: 'Everyone wants to live at the expense of the state',
    quote:
      'Everyone wants to live at the expense of the state. They forget that the state lives at the expense of everyone.',
    author: 'Fr\u00e9d\u00e9ric Bastiat',
  },
  {
    title: 'The only freedom which deserves the name',
    quote:
      'The only freedom which deserves the name is that of pursuing our own good in our own way.',
    author: 'John Stuart Mill',
  },
  {
    title:
      'The government solution to a problem is usually as bad as the problem',
    quote:
      'The government solution to a problem is usually as bad as the problem.',
    author: 'Milton Friedman',
  },
  {
    title: 'A state that dwarfs its men',
    quote:
      'A state that dwarfs its men, in order that they may be more docile instruments in its hands even for beneficial purposes, will find that with small men no great thing can really be accomplished.',
    author: 'John Stuart Mill',
  },
  {
    title: 'He who opens a school door, closes a prison',
    quote: 'He who opens a school door, closes a prison.',
    author: 'Victor Hugo',
  },
  {
    title: 'None are more hopelessly enslaved',
    quote:
      'None are more hopelessly enslaved than those who falsely believe they are free.',
    author: 'Johann Wolfgang von Goethe',
  },
  {
    title: 'The purpose of a constitution',
    quote:
      'The purpose of a constitution is to restrain the government, not the people.',
    author: 'Patrick Henry',
  },
  {
    title: 'The problem with political jokes',
    quote: 'The problem with political jokes is they get elected.',
    author: 'Anonymous',
  },
  {
    title: 'Socialism is a philosophy of failure',
    quote:
      'Socialism is a philosophy of failure, the creed of ignorance, and the gospel of envy.',
    author: 'Winston Churchill',
  },
  {
    title: 'The right to be let alone',
    quote:
      'The right to be let alone is the most comprehensive of rights, and the right most valued by a free people.',
    author: 'Louis Brandeis',
  },
  {
    title: 'As government expands, liberty contracts',
    quote: 'As government expands, liberty contracts.',
    author: 'Ronald Reagan',
  },
  {
    title: 'What is not just is not law',
    quote: 'What is not just is not law.',
    author: 'William Lloyd Garrison',
  },
  {
    title: 'Justice is the end of government',
    quote: 'Justice is the end of government. It is the end of civil society.',
    author: 'James Madison',
  },
  {
    title: 'The Constitution was made to guard the people',
    quote:
      'The Constitution was made to guard the people against the dangers of good intentions.',
    author: 'Daniel Webster',
  },
  {
    title: 'The more laws, the less justice',
    quote: 'The more laws, the less justice.',
    author: 'Marcus Tullius Cicero',
  },
  {
    title: 'There is no worse tyranny',
    quote:
      'There is no worse tyranny than to force a man to pay for what he does not want merely because you think it would be good for him.',
    author: 'Robert A. Heinlein',
  },
  {
    title: 'All socialism involves slavery',
    quote: 'All socialism involves slavery.',
    author: 'Herbert Spencer',
  },
  {
    title: 'The government was set to protect man',
    quote:
      'The government was set to protect man from criminals and the Constitution was written to protect man from the government.',
    author: 'Ayn Rand',
  },
  {
    title: 'When injustice becomes law',
    quote: 'When injustice becomes law, resistance becomes duty.',
    author: 'Thomas Jefferson',
  },
  {
    title:
      "Every collectivist revolution rides in on a Trojan horse of 'Emergency'",
    quote:
      "Every collectivist revolution rides in on a Trojan horse of 'Emergency'.",
    author: 'Herbert Hoover',
  },
  {
    title: 'The philosophy of the schoolroom in one generation',
    quote:
      'The philosophy of the schoolroom in one generation will be the philosophy of government in the next.',
    author: 'Abraham Lincoln',
  },
  {
    title: 'The man who trades freedom for security',
    quote:
      'The man who trades freedom for security does not deserve nor will he ever receive either.',
    author: 'Benjamin Franklin',
  },
  {
    title: 'Democracy is two wolves and a lamb',
    quote:
      'Democracy is two wolves and a lamb voting on what to have for lunch. Liberty is a well-armed lamb contesting the vote.',
    author: 'Benjamin Franklin (attributed)',
  },
  {
    title: 'The urge to save humanity',
    quote:
      'The urge to save humanity is almost always only a false-face for the urge to rule it.',
    author: 'H.L. Mencken',
  },
  {
    title: 'The difference between a welfare state and a totalitarian state',
    quote:
      'The difference between a welfare state and a totalitarian state is a matter of time.',
    author: 'Ayn Rand',
  },
  {
    title: 'Giving money and power to government',
    quote:
      'Giving money and power to government is like giving whiskey and car keys to teenage boys.',
    author: "P.J. O'Rourke",
  },
  {
    title: 'The progress of society depends not on legislation',
    quote:
      'The progress of society depends not on legislation, but on the moral sense of individuals.',
    author: 'William E. Gladstone',
  },
  {
    title: 'The true danger is when liberty is nibbled away',
    quote:
      'The true danger is when liberty is nibbled away, for expedients, and by parts.',
    author: 'Edmund Burke',
  },
  {
    title: 'Government is best which governs the least',
    quote:
      'Government is best which governs the least, because its people discipline themselves.',
    author: 'Thomas Jefferson (attributed)',
  },
  {
    title: 'The worst evils which mankind has ever had to endure',
    quote:
      'The worst evils which mankind has ever had to endure were inflicted by bad governments.',
    author: 'Ludwig von Mises',
  },
  {
    title: 'A free press stands as one of the great interpreters',
    quote:
      'A free press stands as one of the great interpreters between the government and the people.',
    author: 'Herbert Hoover',
  },
  {
    title: 'The ultimate result of shielding men from the effects of folly',
    quote:
      'The ultimate result of shielding men from the effects of folly is to fill the world with fools.',
    author: 'Herbert Spencer',
  },
  {
    title: 'Liberty is not the power of doing what we like',
    quote:
      'Liberty is not the power of doing what we like, but the right of being able to do what we ought.',
    author: 'Lord Acton',
  },
  {
    title: 'The great danger in republics',
    quote:
      'The great danger in republics is that the majority may not sufficiently respect the rights of the minority.',
    author: 'James Madison',
  },
  {
    title: 'The problem is not that people are taxed too little',
    quote:
      'The problem is not that people are taxed too little, the problem is that government spends too much.',
    author: 'Ronald Reagan',
  },
  {
    title: 'There is no liberty without independence of mind',
    quote: 'There is no liberty without independence of mind.',
    author: 'Alexis de Tocqueville',
  },
  {
    title: 'Man is not made for the state',
    quote: 'Man is not made for the state. The state is made for man.',
    author: 'Albert Einstein',
  },
  {
    title: 'Good intentions will always be pleaded',
    quote:
      'Good intentions will always be pleaded for every assumption of authority. It is hardly too strong to say that the Constitution was made to guard the people against the dangers of good intentions.',
    author: 'Daniel Webster',
  },
  {
    title: 'In matters of conscience, the law of the majority has no place',
    quote: 'In matters of conscience, the law of the majority has no place.',
    author: 'Mahatma Gandhi',
  },
  {
    title: 'No freeman shall be debarred the use of arms',
    quote: 'No freeman shall be debarred the use of arms.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'If you want to help the poor',
    quote:
      'If you want to help the poor, demonstrate to them how they can help themselves.',
    author: 'Benjamin Franklin',
  },
  {
    title: 'The problem is not to find better people',
    quote:
      'The problem is not to find better people to govern, but to allow a system that lets the governed govern themselves.',
    author: 'Ludwig von Mises',
  },
  {
    title: 'Liberty must at all hazards be supported',
    quote:
      'Liberty must at all hazards be supported. We have a right to it, derived from our Maker.',
    author: 'John Adams',
  },
  {
    title: 'When the people find they can vote themselves money',
    quote:
      'When the people find they can vote themselves money, that will herald the end of the republic.',
    author: 'Benjamin Franklin (attributed)',
  },
  {
    title: 'Nothing is more destructive of individual character',
    quote:
      'Nothing is more destructive of individual character than being raised in dependence on the government.',
    author: 'Alexis de Tocqueville',
  },
  {
    title: 'To compel a man to subsidize',
    quote:
      'To compel a man to subsidize the teaching of ideas he disbelieves and abhors is sinful and tyrannical.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'It is the duty of the patriot',
    quote:
      'It is the duty of the patriot to protect his country from its government.',
    author: 'Thomas Paine',
  },
  {
    title: 'Eternal vigilance is the price of liberty',
    quote: 'Eternal vigilance is the price of liberty.',
    author: 'Wendell Phillips',
  },
  {
    title: 'Without liberty, law loses its nature',
    quote:
      'Without liberty, law loses its nature and justice loses its meaning.',
    author: 'Alexander Hamilton',
  },
  {
    title: 'The rights of man come not from the generosity of the state',
    quote:
      'The rights of man come not from the generosity of the state but from the hand of God.',
    author: 'John F. Kennedy',
  },
  {
    title: 'Government is the great fiction',
    quote:
      'Government is the great fiction through which everybody endeavors to live at the expense of everybody else.',
    author: 'Frédéric Bastiat',
  },
  {
    title: 'When all men are paid for existing',
    quote:
      'When all men are paid for existing and no man must pay for his sins, then the Party is over.',
    author: 'G.K. Chesterton',
  },
  {
    title: 'We are not to expect to be transported from despotism to liberty',
    quote:
      'We are not to expect to be transported from despotism to liberty in a featherbed.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'The ultimate authority resides in the people alone',
    quote: 'The ultimate authority resides in the people alone.',
    author: 'James Madison',
  },
  {
    title: 'The rights of individuals should be the primary object',
    quote:
      'The rights of individuals should be the primary object of all governments.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'There are no necessary evils in government',
    quote:
      'There are no necessary evils in government. Its evils exist only in its abuses.',
    author: 'Andrew Jackson',
  },
  {
    title: 'The most dangerous man to any government',
    quote:
      'The most dangerous man to any government is the man who is able to think things out for himself.',
    author: 'H.L. Mencken',
  },
  {
    title: 'The state is a servant of the people',
    quote:
      'The state is a servant of the people. It must never become an absolute master.',
    author: 'Vaclav Havel',
  },
  {
    title: 'Freedom is the will to be responsible to ourselves',
    quote: 'Freedom is the will to be responsible to ourselves.',
    author: 'Friedrich Hayek',
  },
  {
    title: 'None can love freedom heartily',
    quote:
      'None can love freedom heartily but good men; the rest love not freedom but license.',
    author: 'John Milton',
  },
  {
    title: 'A government resting on the minority is an aristocracy',
    quote:
      'A government resting on the minority is an aristocracy, not a democracy.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'Every man has a property in his own person',
    quote:
      'Every man has a property in his own person. This nobody has a right to, but himself.',
    author: 'John Locke',
  },
  {
    title: 'The first duty of society is justice',
    quote: 'The first duty of society is justice.',
    author: 'Alexander Hamilton',
  },
  {
    title: 'He who dares not offend cannot be honest',
    quote: 'He who dares not offend cannot be honest.',
    author: 'Thomas Paine',
  },
  {
    title: 'Let us not seek the Republican answer or the Democratic answer',
    quote:
      'Let us not seek the Republican answer or the Democratic answer, but the right answer.',
    author: 'John F. Kennedy',
  },
  {
    title: 'The freedom to fail is vital',
    quote:
      'The freedom to fail is vital if we are to have the freedom to succeed.',
    author: 'Milton Friedman',
  },
  {
    title: 'The danger in democracy is not tyranny by the minority',
    quote:
      'The danger in democracy is not tyranny by the minority but tyranny by the majority.',
    author: 'James Madison',
  },
  {
    title: 'All great change in America begins at the dinner table',
    quote: 'All great change in America begins at the dinner table.',
    author: 'Ronald Reagan',
  },
  {
    title: 'The man who is not allowed to own property',
    quote:
      'The man who is not allowed to own property is a man reduced to dependence.',
    author: 'John Locke',
  },
  {
    title: 'Freedom is never voluntarily given by the oppressor',
    quote:
      'Freedom is never voluntarily given by the oppressor; it must be demanded by the oppressed.',
    author: 'Martin Luther King Jr.',
  },
  {
    title: 'The rule of law is the most civilized concept',
    quote:
      'The rule of law is the most civilized concept humanity has yet devised.',
    author: 'Margaret Thatcher',
  },
  {
    title: 'Never doubt that a small group of thoughtful citizens',
    quote:
      'Never doubt that a small group of thoughtful, committed citizens can change the world. Indeed, it is the only thing that ever has.',
    author: 'Margaret Mead',
  },
  {
    title: 'No government can exist without taxation',
    quote:
      'No government can exist without taxation. This money must necessarily be drawn from the pockets of the people.',
    author: 'John Marshall',
  },
  {
    title: 'When people fear the government, there is tyranny',
    quote:
      'When people fear the government, there is tyranny; when the government fears the people, there is liberty.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'The legitimate object of government',
    quote:
      'The legitimate object of government is to do for a community of people whatever they need to have done but cannot do at all in their separate and individual capacities.',
    author: 'Abraham Lincoln',
  },
  {
    title: 'Laws that forbid the carrying of arms',
    quote:
      'Laws that forbid the carrying of arms disarm only those who are neither inclined nor determined to commit crimes.',
    author: 'Thomas Jefferson (quoting Cesare Beccaria)',
  },
  {
    title: 'The goal of socialism is communism',
    quote: 'The goal of socialism is communism.',
    author: 'Vladimir Lenin',
  },
  {
    title: 'I own that I am not a friend to a very energetic government',
    quote:
      'I own that I am not a friend to a very energetic government. It is always oppressive.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'I predict future happiness for Americans',
    quote:
      'I predict future happiness for Americans if they can prevent the government from wasting the labors of the people under the pretense of taking care of them.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'A people who mean to be their own governors',
    quote:
      'A people who mean to be their own governors must arm themselves with the power knowledge gives.',
    author: 'James Madison',
  },
  {
    title: "No man's life, liberty or property is safe",
    quote:
      "No man's life, liberty or property is safe while the legislature is in session.",
    author: 'Gideon J. Tucker',
  },
  {
    title: 'To sin by silence when they should protest',
    quote: 'To sin by silence when they should protest makes cowards of men.',
    author: 'Ella Wheeler Wilcox',
  },
  {
    title: 'Only a virtuous people are capable of freedom',
    quote:
      'Only a virtuous people are capable of freedom. As nations become corrupt and vicious, they have more need of masters.',
    author: 'Benjamin Franklin',
  },
  {
    title: 'The history of liberty is a history of resistance',
    quote: 'The history of liberty is a history of resistance.',
    author: 'Woodrow Wilson',
  },
  {
    title: 'The tree of liberty must be refreshed',
    quote:
      'The tree of liberty must be refreshed from time to time with the blood of patriots and tyrants.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'The advancement and diffusion of knowledge',
    quote:
      'The advancement and diffusion of knowledge is the only guardian of true liberty.',
    author: 'James Madison',
  },
  {
    title: 'I would rather be exposed to the inconveniences',
    quote:
      'I would rather be exposed to the inconveniences attending too much liberty than those attending too small a degree of it.',
    author: 'Thomas Jefferson',
  },
  {
    title: 'Our Constitution was made only for a moral and religious people',
    quote:
      'Our Constitution was made only for a moral and religious people. It is wholly inadequate to the government of any other.',
    author: 'John Adams',
  },
  {
    title: 'To educate a man in mind and not in morals',
    quote:
      'To educate a man in mind and not in morals is to educate a menace to society.',
    author: 'Theodore Roosevelt',
  },
]

// Current count: 195 unique quotes
module.exports = quotes
